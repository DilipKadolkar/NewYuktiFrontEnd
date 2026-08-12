import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { DataGrid } from '@mui/x-data-grid';

export default function DataTable({
  rows,
  columns,
  loading,
  getRowId,
  pageSize = 10,
  height = 560,
  density = 'standard',
  sx,
  ...rest
}) {
  return (
    <Paper variant="outlined" sx={{ borderColor: 'divider', overflow: 'hidden' }}>
      <Box sx={{ height, width: '100%' }}>
        <DataGrid
          rows={rows || []}
          columns={columns}
          loading={loading}
          getRowId={getRowId}
          density={density}
          disableRowSelectionOnClick
          initialState={{
            pagination: { paginationModel: { pageSize, page: 0 } },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          sx={[
            { border: 'none', '--DataGrid-overlayHeight': '200px' },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
          {...rest}
        />
      </Box>
    </Paper>
  );
}
