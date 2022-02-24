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
import { Stack, Avatar, InputLabel, MenuItem, FormControl, Select, Button } from '@material-ui/core';
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
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: 'rank',
    numeric: false,
    disablePadding: true,
    label: 'Rank'
  },
  {
    id: 'name',
    numeric: false,
    disablePadding: true,
    label: 'Collection'
  },
  {
    id: 'volume',
    numeric: true,
    disablePadding: false,
    label: 'Volume'
  },
  {
    id: 'oneDayChange',
    numeric: true,
    disablePadding: false,
    label: '24h %'
  },
  {
    id: 'sevenDayChange',
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
  {
    id: 'owners',
    numeric: true,
    disablePadding: false,
    label: 'Owners'
  },
  {
    id: 'items',
    numeric: true,
    disablePadding: false,
    label: 'Items'
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
              onClick={() => createSortHandler(headCell.id)}
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
  { label: 'Last 24 hours', value: '1day' },
  { label: 'Last 7 days', value: '7days' },
  { label: 'Last 30 days', value: '30days' },
  { label: 'All time', value: 'total' }
];

export default function EnhancedTable() {
  const [data, setData] = React.useState([]);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('rank');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(100);
  const [period, setPeriod] = React.useState('1day');
  const [store, setStore] = React.useState([]);
  const [pageNum, setPageNum] = React.useState(1);
  const [maxPageNum, setMaxPageNum] = React.useState(1);

  useEffect(() => {
    axios
      .post(`${process.env.REACT_APP_API_BASE_URL}getRank`, {
        period: '1day',
        pageNum: 1
      })
      .then((response) => {
        setStore(response.data.ranking);
        setData(response.data.ranking);
      });
  }, []);
  const handleChangePeriod = (event) => {
    const periodValue = event.target.value;
    setPeriod(periodValue);
    axios
      .post(`${process.env.REACT_APP_API_BASE_URL}getRank`, {
        periodValue,
        pageNum: 1
      })
      .then((response) => {
        setStore(response.data.ranking);
        setData(response.data.ranking);
      });
  };
  const clickPageHanlder = (type) => {
    const currentPageNum = pageNum;
    let nextPageNum = 0;
    if (type === '+') {
      nextPageNum = currentPageNum + 1;
      if (nextPageNum > maxPageNum) {
        setMaxPageNum(nextPageNum);
        axios
          .post(`${process.env.REACT_APP_API_BASE_URL}getRank`, {
            period,
            pageNum: nextPageNum
          })
          .then((response) => {
            setStore(...store, response.data.ranking);
            setData(response.data.ranking);
          });
      } else {
        setData(store[currentPageNum]);
      }
    } else {
      nextPageNum = currentPageNum - 1;
      setData(store[nextPageNum - 1]);
    }
    setPageNum(nextPageNum);
  };

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

    const reorderData = reorder(
      data,
      result.source.index + page * rowsPerPage,
      page * rowsPerPage + result.destination.index
    );
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
              <MenuItem value={temp.value}>{temp.label}</MenuItem>
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
                                  role="checkbox"
                                  tabIndex={-1}
                                  key={row.name}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <TableCell align="right" id={labelId}>
                                    {row.rank}
                                  </TableCell>
                                  <TableCell component="th" id={labelId} scope="row" padding="none">
                                    <Stack direction="row" spacing={2}>
                                      <Stack>
                                        {/* <img rounded src={row.img_url} alt="logo_image" /> */}
                                        <Avatar rounded src={row.logo} alt="logo_image" />
                                      </Stack>
                                      <Stack direction="column">
                                        <Stack>{row.name}</Stack>
                                      </Stack>
                                    </Stack>
                                  </TableCell>
                                  <TableCell align="right" id={labelId}>
                                    {row.volume ? row.volume : '-'}
                                  </TableCell>
                                  <TableCell align="right" id={labelId}>
                                    {row.oneDayChange ? row.oneDayChange : '-'}
                                  </TableCell>
                                  <TableCell align="right" id={labelId}>
                                    {row.sevenDayChange ? row.sevenDayChange : '-'}
                                  </TableCell>
                                  <TableCell align="right" id={labelId}>
                                    {row.floorPrice ? row.floorPrice : '-'}
                                  </TableCell>
                                  <TableCell align="right" id={labelId}>
                                    {row.owners ? row.owners : '-'}
                                  </TableCell>
                                  <TableCell align="right" id={labelId}>
                                    {row.items ? row.items : '-'}
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
        </Paper>
        <Stack direction="row" spaciing={2}>
          <Button variant="outlined" onClick={() => clickPageHanlder('-')}>
            {pageNum > 1 ? `${1 + (pageNum - 2) * 100} - ${(pageNum - 1) * 100}` : `1 - 100`}
          </Button>
          <Button variant="outlined" onClick={() => clickPageHanlder('+')}>
            {1 + pageNum * 100} - {(pageNum + 1) * 100}
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
}
