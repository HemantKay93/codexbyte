-- Migration to create the update_campaign_analytics RPC
-- This safely updates the JSONB delivery_metrics based on recipient status updates

CREATE OR REPLACE FUNCTION update_campaign_analytics(p_campaign_id UUID, p_status TEXT)
RETURNS void AS $$
DECLARE
  v_current_metrics JSONB;
BEGIN
  -- Select the row for update to lock it and prevent race conditions
  SELECT delivery_metrics INTO v_current_metrics
  FROM campaign_analytics
  WHERE campaign_id = p_campaign_id
  FOR UPDATE;

  -- If it doesn't exist, create it with initial values
  IF NOT FOUND THEN
    INSERT INTO campaign_analytics (campaign_id, delivery_metrics)
    VALUES (
      p_campaign_id, 
      jsonb_build_object('sent', 0, 'delivered', 0, 'bounced', 0, 'opened', 0, 'clicked', 0, 'failed', 0, 'spam_reported', 0)
    );
    v_current_metrics := jsonb_build_object('sent', 0, 'delivered', 0, 'bounced', 0, 'opened', 0, 'clicked', 0, 'failed', 0, 'spam_reported', 0);
  END IF;

  -- Ensure the key exists in JSONB and increment it
  -- Coalesce prevents nulls if the key is missing in an older JSON object
  v_current_metrics := jsonb_set(
    v_current_metrics, 
    ARRAY[p_status], 
    to_jsonb(COALESCE((v_current_metrics->>p_status)::int, 0) + 1)
  );

  -- Update the row
  UPDATE campaign_analytics
  SET delivery_metrics = v_current_metrics,
      last_updated_at = NOW()
  WHERE campaign_id = p_campaign_id;

END;
$$ LANGUAGE plpgsql;
