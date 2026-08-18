import { useCallback, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useSnackbar } from 'notistack';
import PageHeader from './PageHeader';
import DataTable from './DataTable';
import ConfirmDialog from './ConfirmDialog';
import MasterFormDialog from './MasterFormDialog';

export default function MasterCrudPage({
  title,
  subtitle,
  api,
  columns,
  fields,
  entityLabel = 'record',
  extraColumnsAtEnd = true,
  readOnly = false,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api
      .list()
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setFormOpen(true);
  };

  const handleSubmit = (values) => {
    setSaving(true);
    const action = editing ? api.update(editing.id, values) : api.create(values);
    action
      .then(() => {
        enqueueSnackbar(`${entityLabel} ${editing ? 'updated' : 'created'} successfully`, {
          variant: 'success',
        });
        setFormOpen(false);
        load();
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setDeleting(true);
    api
      .remove(deleteTarget.id)
      .then(() => {
        enqueueSnackbar(`${entityLabel} deleted`, { variant: 'success' });
        setDeleteTarget(null);
        load();
      })
      .catch(() => {})
      .finally(() => setDeleting(false));
  };

  const gridColumns = [
    ...columns,
    ...(extraColumnsAtEnd && !readOnly
      ? [
          {
            field: 'actions',
            headerName: '',
            sortable: false,
            filterable: false,
            width: 100,
            renderCell: (params) => (
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => openEdit(params.row)}>
                    <EditRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => setDeleteTarget(params.row)}>
                    <DeleteRoundedIcon fontSize="small" color="error" />
                  </IconButton>
                </Tooltip>
              </Stack>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          !readOnly && (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>
              Add {entityLabel}
            </Button>
          )
        }
      />
      <DataTable rows={rows} columns={gridColumns} loading={loading} height={520} />

      {!readOnly && (
        <>
          <MasterFormDialog
            open={formOpen}
            title={editing ? `Edit ${entityLabel}` : `Add ${entityLabel}`}
            fields={fields}
            initialValues={editing}
            saving={saving}
            onClose={() => setFormOpen(false)}
            onSubmit={handleSubmit}
          />

          <ConfirmDialog
            open={!!deleteTarget}
            title={`Delete ${entityLabel}?`}
            description={`This will permanently remove "${
              deleteTarget?.companyName || deleteTarget?.departmentName || deleteTarget?.designationName || deleteTarget?.categoryName || deleteTarget?.shiftName || ''
            }". This cannot be undone.`}
            confirmLabel="Delete"
            confirmColor="error"
            loading={deleting}
            onConfirm={handleDelete}
            onClose={() => setDeleteTarget(null)}
          />
        </>
      )}
    </>
  );
}
