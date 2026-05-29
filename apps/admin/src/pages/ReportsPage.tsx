export function ReportsPage() {
  const handleExport = async (type: string, format: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `http://localhost:8080/api/reports/export?type=${type}&format=${format}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${type}_${Date.now()}.${format === 'excel' ? 'xlsx' : 'csv'}`;
        // eslint-disable-line react-hooks/purity
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to export report');
      }
    } catch (error) {
      // eslint-disable-line @typescript-eslint/no-unused-vars
      alert('Error connecting to server');
    }
  };

  return (
    <main style={{ padding: 48 }}>
      <h1>Reports</h1>
      <p style={{ color: '#8B9BB8' }}>
        Daily/monthly sales summaries and CSV or Excel export workflows.
      </p>
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 16,
          marginTop: 24,
        }}
      >
        {[
          {
            title: 'Daily Sales',
            description: 'Export day-wise revenue, order count, and returns.',
          },
          {
            title: 'Monthly Sales',
            description: 'Export monthly GMV, AOV, top categories, and repeat rate.',
          },
          {
            title: 'Shipment Report',
            description: 'Export AWB, courier, tracking status, and SLA exceptions.',
          },
        ].map((report) => (
          <article
            key={report.title}
            style={{
              padding: 24,
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
            }}
          >
            <h2>{report.title}</h2>
            <p style={{ color: '#8B9BB8', lineHeight: 1.6 }}>{report.description}</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button
                onClick={() => handleExport(report.title.toLowerCase().replace(' ', '_'), 'csv')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  background: 'rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                }}
              >
                CSV
              </button>
              <button
                onClick={() => handleExport(report.title.toLowerCase().replace(' ', '_'), 'excel')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: 0,
                  color: '#fff',
                  background: 'linear-gradient(135deg, #1A4FD6, #3B7BF8)',
                  cursor: 'pointer',
                }}
              >
                Excel
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
