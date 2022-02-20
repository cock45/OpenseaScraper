import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { styled, useTheme } from '@material-ui/core/styles';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Stack,
  Avatar,
  Box,
  InputLabel,
  MenuItem,
  FormControl,
  Select
} from '@material-ui/core';
import axios from 'axios';
// hooks
// ----------------------------------------------------------------------
// Mokupdata
// -------------------------------------------------------------------------------------
const columns = [
  { id: 'name', label: 'NFT Collection', minWidth: 170 },
  { id: 'volume', label: 'Volume(ETH)', minWidth: 100 },
  {
    id: 'avgprice',
    label: 'Avg Price(ETH)',
    minWidth: 170
    // align: 'right'
  },
  {
    id: 'floor',
    label: 'Floor(ETH)',
    minWidth: 170,
    align: 'right'
  }
];

function createData(name, volume, avgprice, floor) {
  // const density = population / size;
  return { name, volume, avgprice, floor };
}

const rows = [];
// eslint-disable-next-line camelcase
const period_init = [
  { value: '1 hour' },
  { value: '2 hours' },
  { value: '3 hours' },
  { value: '1 day' },
  { value: '7 days' },
  { value: '1 month' }
];
// -------------------------------------------------------------------------------------
export default function StickyHeadTable() {
  const [page, setPage] = React.useState(0);
  const [collectiondata, setCollectiondata] = useState([]);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [period, setPeriod] = React.useState('1 hour');
  const [data, setData] = React.useState([]);
  const [test, setTest] = useState({});

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleChangePeriod = (event) => {
    setPeriod(event.target.value);
  };

  useEffect(() => {
    const options = {
      method: 'GET',
      url: 'https://api.opensea.io/api/v1/collections?offset=0&limit=300',
      headers: { Accept: 'application/json' }
    };

    axios.get('https://api.opensea.io/api/v1/collections?offset=0&limit=300').then(async (response) => {
      // console.log("response=>", response);
      console.log('get opensea api======', response.data.collections);
      setCollectiondata(response.data.collections);
      console.log('collectiondata====', collectiondata);
      setData(
        response.data.collections.map((collection) => {
          const result = {
            name: collection.name,
            volume: collection.stats.total_volume,
            avgprice: collection.stats.average_price,
            floor: collection.stats.floor_price,
            img_url: collection.image_url,
            total_supply: collection.stats.total_supply
          };
          return result;
        })
      );
    });
  }, []);
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
            {period_init.map((temp, index) => (
              <MenuItem value={temp.value}>{temp.value}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 800 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align} style={{ minWidth: column.minWidth }}>
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="tablebody">
                {(provided) => (
                  <TableBody className="tablebody" {...provided.droppableProps} ref={provided.innerRef}>
                    {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
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
                            {columns.map((column) => {
                              if (column.id === 'name') {
                                return (
                                  <TableCell key={column.id} align={column.align}>
                                    <Stack direction="row" spacing={2}>
                                      <Stack>
                                        {/* <img rounded src={row.img_url} alt="logo_image" /> */}
                                        <Avatar rounded src={row.img_url} alt="logo_image" />
                                      </Stack>
                                      <Stack direction="column">
                                        <Stack>{row.name}</Stack>
                                        <Stack>TotalSupply: {row.total_supply}</Stack>
                                      </Stack>
                                    </Stack>
                                  </TableCell>
                                );
                              }
                              const value = row[column.id];
                              return (
                                <TableCell key={column.id} align={column.align}>
                                  {column.format && typeof value === 'number' ? column.format(value) : value}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        )}
                      </Draggable>
                    ))}
                  </TableBody>
                )}
              </Droppable>
            </DragDropContext>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={collectiondata.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Stack>
  );
}
// -----------------------------------------------------------------------------------
const RootStyle = styled('div')({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden'
});

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};
