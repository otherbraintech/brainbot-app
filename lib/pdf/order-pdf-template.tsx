import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Standard fonts work out of the box, but we could Register custom ones if needed
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333',
  },
  header: {
    marginBottom: 20,
    borderBottom: '1px solid #1a1a1a',
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    backgroundColor: '#f3f4f6',
    padding: 4,
    color: '#111827',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  gridItem: {
    width: '50%',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    color: '#6b7280',
    fontSize: 8,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 10,
    marginTop: 2,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 5,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 5,
    alignItems: 'flex-start',
  },
  colId: { 
    width: '5%',
    paddingRight: 2
  },
  colText: { 
    width: '45%',
    paddingRight: 10
  },
  colDevice: { 
    width: '30%',
    paddingRight: 5,
    fontSize: 9
  },
  colStatus: { 
    width: '20%',
    textAlign: 'right'
  },
  statusPublished: { color: '#059669' },
  statusPending: { color: '#d97706' },
  footer: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    left: 30,
    borderTop: '1px solid #e5e7eb',
    paddingTop: 10,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 8,
  }
});

interface OrderPDFProps {
  order: any;
  project: any;
  comments: any[];
}

export const OrderPDFTemplate = ({ order, project, comments }: OrderPDFProps) => {
  const orderDate = new (globalThis as any).Date(order.createdAt).toLocaleString("es-ES", {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });

  const reportDate = new (globalThis as any).Date().toLocaleString("es-ES", {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <Document title={`Orden ${order.orderName || order.id}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>BrainBot - Reporte de Orden</Text>
            <Text style={{ color: '#6b7280', marginTop: 2, fontSize: 9 }}>Reporte generado el: {reportDate}</Text>
          </View>
        </View>

        {/* Info Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen de la Orden</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Nombre de Orden</Text>
              <Text style={styles.value}>{order.orderName}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>ID de Orden</Text>
              <Text style={styles.value}>{order.id}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Red Social</Text>
              <Text style={styles.value}>{order.socialNetwork}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Estado</Text>
              <Text style={styles.value}>
                {order.status === 'GENERADA' ? 'En Operación' : order.status}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Cantidad Solicitada</Text>
              <Text style={styles.value}>{order.quantity}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Tipo de Publicación</Text>
              <Text style={styles.value}>{order.postType}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Fecha de Creación (Orden)</Text>
              <Text style={styles.value}>{orderDate}</Text>
            </View>
          </View>
        </View>

        {/* Project Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles del Proyecto</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Nombre del Proyecto</Text>
              <Text style={styles.value}>{project.name}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Postura (Stance)</Text>
              <Text style={styles.value}>{project.stance}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>URL Original</Text>
              <Text style={styles.value}>{order.url}</Text>
            </View>
          </View>
        </View>

        {/* Comments/Executions Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lista de Ejecuciones / Comentarios</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colId}>#</Text>
              <Text style={styles.colText}>Contenido / Texto</Text>
              <Text style={styles.colDevice}>Dispositivo</Text>
              <Text style={styles.colStatus}>Estado</Text>
            </View>
            {comments.map((comment, index) => (
              <View key={comment.id} style={styles.tableRow}>
                <Text style={styles.colId}>{index + 1}</Text>
                <Text style={styles.colText}>{comment.text || "N/A"}</Text>
                <Text style={styles.colDevice}>{comment.device?.deviceName || "---"}</Text>
                <Text style={[
                  styles.colStatus,
                  comment.status === 'PUBLICADO' ? styles.statusPublished : styles.statusPending
                ]}>
                  {comment.status}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generado automáticamente por BrainBot - Sistema de Automatización
        </Text>
      </Page>
    </Document>
  );
};
