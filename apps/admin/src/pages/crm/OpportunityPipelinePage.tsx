import { Card, Button, Badge } from '@byteevolvr/ui';
import { Plus, MoreHorizontal, DollarSign } from 'lucide-react';

export function OpportunityPipelinePage() {
  // Mock data for Kanban board
  const stages = [
    {
      id: 'stg-1',
      name: 'Prospecting',
      value: 150000,
      opportunities: [
        {
          id: 'opp-1',
          name: 'Dunder Mifflin Paper Supply',
          value: 45000,
          probability: 20,
          owner: 'Jim Halpert',
        },
        {
          id: 'opp-2',
          name: 'Michael Scott Paper Co',
          value: 105000,
          probability: 10,
          owner: 'Ryan Howard',
        },
      ],
    },
    {
      id: 'stg-2',
      name: 'Qualification',
      value: 85000,
      opportunities: [
        {
          id: 'opp-3',
          name: 'Athlead Contract',
          value: 85000,
          probability: 40,
          owner: 'Jim Halpert',
        },
      ],
    },
    {
      id: 'stg-3',
      name: 'Proposal/Quote',
      value: 320000,
      opportunities: [
        {
          id: 'opp-4',
          name: 'Scranton White Pages',
          value: 320000,
          probability: 70,
          owner: 'Dwight Schrute',
        },
      ],
    },
    {
      id: 'stg-4',
      name: 'Negotiation',
      value: 0,
      opportunities: [],
    },
    {
      id: 'stg-5',
      name: 'Closed Won',
      value: 1200000,
      opportunities: [
        {
          id: 'opp-5',
          name: 'Lackawanna County',
          value: 1200000,
          probability: 100,
          owner: 'Michael Scott',
        },
      ],
    },
  ];

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Opportunity Pipeline</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Drag and drop deals across stages to track sales progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Opportunity
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="w-80 flex-shrink-0 flex flex-col gap-3 bg-surface-container-lowest rounded-xl p-3 border border-outline-variant/50"
          >
            <div className="flex items-center justify-between px-1">
              <h3 className="font-semibold text-on-surface">{stage.name}</h3>
              <Badge variant="default">{stage.opportunities.length}</Badge>
            </div>
            <div className="text-xs font-medium text-on-surface-variant px-1 border-b border-outline-variant pb-2 mb-1">
              Total Value: ₹{stage.value.toLocaleString()}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {stage.opportunities.map((opp) => (
                <Card
                  key={opp.id}
                  className="p-3 cursor-grab active:cursor-grabbing hover:border-primary transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm text-on-surface leading-tight">
                      {opp.name}
                    </h4>
                    <button className="text-on-surface-variant hover:text-on-surface">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 text-primary font-medium text-sm mb-3">
                    <DollarSign className="h-3.5 w-3.5" />
                    {opp.value.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-between text-xs text-on-surface-variant">
                    <div className="flex items-center gap-1">
                      <div className="h-5 w-5 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-[10px]">
                        {opp.owner.charAt(0)}
                      </div>
                      <span>{opp.owner.split(' ')[0]}</span>
                    </div>
                    <div>{opp.probability}% Prob.</div>
                  </div>
                </Card>
              ))}

              <button className="w-full py-2 flex items-center justify-center gap-2 text-sm text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-colors border border-dashed border-outline-variant">
                <Plus className="h-4 w-4" />
                Add Deal
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
