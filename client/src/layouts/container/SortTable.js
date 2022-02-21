import * as React from 'react';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { Stack, Avatar, InputLabel, MenuItem, FormControl, Select } from '@material-ui/core';
import { visuallyHidden } from '@material-ui/utils';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';

function createData(name, volume, avg, floor, protein) {
  return {
    name,
    volume,
    avg,
    floor,
    protein
  };
}

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// This method is created for cross-browser compatibility, if you don't
// need to support IE11, you can use Array.prototype.sort() directly
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => {
    console.log('sorted', el[0]);

    return el[0];
  });
}

const headCells = [
  {
    id: 'name',
    numeric: false,
    disablePadding: true,
    label: 'Collection'
  },
  {
    id: 'oneDayVolume',
    numeric: true,
    disablePadding: false,
    label: 'Volume'
  },
  {
    id: 'oneDayVolume',
    numeric: true,
    disablePadding: false,
    label: '24h %'
  },
  {
    id: 'sevenDayVolume',
    numeric: true,
    disablePadding: false,
    label: '7d %'
  },
  {
    id: 'floorPrice',
    numeric: true,
    disablePadding: false,
    label: 'Floor Price'
  },
  // {
  //   id: 'avg',
  //   numeric: true,
  //   disablePadding: false,
  //   label: 'Average Price'
  // },
  {
    id: 'num_owners',
    numeric: true,
    disablePadding: false,
    label: 'Owners'
  }
];

function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {/* <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all desserts'
            }}
          />
        </TableCell> */}
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired
};

const EnhancedTableToolbar = (props) => {
  const { numSelected } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity)
        })
      }}
    >
      {numSelected > 0 ? (
        <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1" component="div">
          {numSelected} selected
        </Typography>
      ) : (
        <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
          Nutrition
        </Typography>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton>{/* <DeleteIcon /> */}</IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>{/* <FilterListIcon /> */}</IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired
};

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const periodInit = [
  { value: '1 hour' },
  { value: '2 hours' },
  { value: '3 hours' },
  { value: '1 day' },
  { value: '7 days' },
  { value: '1 month' }
];

export default function EnhancedTable() {
  const [data, setData] = React.useState([]);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('volume');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [period, setPeriod] = React.useState('1 hour');

  const handleChangePeriod = (event) => {
    setPeriod(event.target.value);
  };

  useEffect(() => {
    // const options = {
    //   method: 'GET',
    //   url: 'https://api.opensea.io/api/v1/collections?offset=0&limit=300',
    //   headers: { Accept: 'application/json' }
    // };

    axios.get('http://localhost:3001/api/getRank').then(async (response) => {
      console.log('response=>', response.data.ranking);

      setData(response.data.ranking);
    });
  }, []);
  // response.data.ranking.map((collection) => {
  //   const result = {
  //     img_url: collection.logo,
  //     name: collection.name,
  //     // volume: collection.stats.total_volume,
  //     // one_day_volume; collection.
  //     // one_week_volume; collection.
  //     floor: collection.floorPrice
  //     // avg: collection.stats.average_price,
  //     // total_supply: collection.stats.total_supply
  //   };
  //   return result;
  // })

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = data.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  function onDragEnd(result) {
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    console.log('after onDragEng=>', result);
    const reorderData = reorder(
      data,
      result.source.index + page * rowsPerPage,
      page * rowsPerPage + result.destination.index
    );
    console.log('reoderData=>', reorderData);
    setData(reorderData);
  }
  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

  return (
    <Stack>
      <Box sx={{ minWidth: 120, maxWidth: 400 }}>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Period</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={period}
            label="Period"
            onChange={handleChangePeriod}
          >
            {periodInit.map((temp, index) => (
              <MenuItem value={temp.value}>{temp.value}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ width: '100%' }}>
        <Paper sx={{ width: '100%', mb: 2 }}>
          <EnhancedTableToolbar numSelected={selected.length} />
          <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={dense ? 'small' : 'medium'}>
              <EnhancedTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={data.length}
              />
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="tablebody">
                  {(provided) => (
                    <TableBody className="tablebody" {...provided.droppableProps} ref={provided.innerRef}>
                      {/* if you don't need to support IE11, you can replace the `stableSort` call with:
                 rows.slice().sort(getComparator(order, orderBy)) */}
                      {/* {setData(stableSort(data, getComparator(order, orderBy)))} */}
                      {stableSort(data, getComparator(order, orderBy))
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row, index) => {
                          const isItemSelected = isSelected(row.name);
                          const labelId = `enhanced-table-checkbox-${index}`;

                          return (
                            <Draggable key={row.name} draggableId={row.name} index={index}>
                              {(provided) => (
                                <TableRow
                                  hover
                                  // onClick={(event) => handleClick(event, row.name)}
                                  role="checkbox"
                                  // aria-checked={isItemSelected}
                                  tabIndex={-1}
                                  key={row.name}
                                  // selected={isItemSelected}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  {/* <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{
                            'aria-labelledby': labelId
                          }}
                        />
                      </TableCell> */}
                                  <TableCell component="th" id={labelId} scope="row" padding="none">
                                    <Stack direction="row" spacing={2}>
                                      <Stack>
                                        {/* <img rounded src={row.img_url} alt="logo_image" /> */}
                                        <Avatar rounded src={row.logo} alt="logo_image" />
                                      </Stack>
                                      <Stack direction="column">
                                        <Stack>{row.name}</Stack>
                                        <Stack>TotalSupply: {row.totalSupply}</Stack>
                                      </Stack>
                                    </Stack>
                                  </TableCell>
                                  <TableCell align="right" id={labelId}>
                                    {row.oneDayVolume.toFixed(2)}
                                  </TableCell>
                                  <TableCell align="right" id={labelId}>
                                    <Stack direction="column" spacing={2}>
                                      <Stack>{row.oneDayVolume.toFixed(2)}</Stack>
                                      <Stack>{(row.oneDayChange * 100).toFixed(2)}%</Stack>
                                    </Stack>
                                  </TableCell>
                                  <TableCell align="right" id={labelId}>
                                    <Stack direction="column" spacing={2}>
                                      <Stack>{row.sevenDayVolume.toFixed(2)}</Stack>
                                      <Stack>{(row.sevenDayChange * 100).toFixed(2)}%</Stack>
                                    </Stack>
                                  </TableCell>
                                  <TableCell align="right" id={labelId}>
                                    {row.floorPrice.toFixed(2)}
                                  </TableCell>
                                  {/* <TableCell align="right">{row.avg}</TableCell> */}
                                  <TableCell align="right" id={labelId}>
                                    {(row.numOwners / 1000).toFixed(1)}K
                                  </TableCell>
                                </TableRow>
                              )}
                            </Draggable>
                          );
                        })}
                      {emptyRows > 0 && (
                        <TableRow
                          style={{
                            height: (dense ? 33 : 53) * emptyRows
                          }}
                        >
                          <TableCell colSpan={6} />
                        </TableRow>
                      )}
                    </TableBody>
                  )}
                </Droppable>
              </DragDropContext>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 100]}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
        {/* <FormControlLabel control={<Switch checked={dense} onChange={handleChangeDense} />} label="Dense padding" /> */}
      </Box>
    </Stack>
  );
}
