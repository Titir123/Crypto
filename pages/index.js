import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setCoins, resetCoins, updateCoin } from '@/toolkit/cryptoSlice';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button, Dialog, TableSortLabel, TextField } from '@mui/material';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const fetchCoins = async () => {
  const response = await axios.get('https://api.coincap.io/v2/assets');
  const data = response.data.data;
  return Array.isArray(data) ? data : [];
};

export default function Home() {
  const dispatch = useDispatch();
  const { list: coins, status, error } = useSelector((state) => state.coins);
  const [search, setSearch] = useState('');
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [open, setOpen] = useState(false);
  const [editedCoin, setEditedCoin] = useState(null);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');

  const { refetch, isLoading, isError, data } = useQuery({
    queryKey: ["coins"],
    queryFn: fetchCoins,
    staleTime: 5000,
    cacheTime: 2000,
    onSuccess: (data) => {
      dispatch(setCoins(data));
    },
  });

  React.useEffect(() => {
    if (data) {
      dispatch(setCoins(data));
    }
  }, [data, dispatch]);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error fetching data</p>;

  const handleRefresh = () => {
    dispatch(resetCoins());
    refetch();
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleRowClick = async (coin) => {
    try {
      const response = await axios.get(`https://api.coincap.io/v2/assets/${coin.id}`);
      setSelectedCoin(response.data);
      setEditedCoin(response.data);
      setOpen(true);
    } catch (error) {
      console.error('Error fetching coin details:', error);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedCoin((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = () => {
    if (editedCoin) {
      dispatch(updateCoin(editedCoin));
      setOpen(false);
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedCoins = [...(coins || [])].sort((a, b) => {
    const aValue = a[orderBy]?.toLowerCase() || '';
    const bValue = b[orderBy]?.toLowerCase() || '';
    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredCoins = sortedCoins.filter((coin) =>
    (coin && coin.name ? coin.name.toLowerCase().includes(search.toLowerCase()) : false)
  );

  return (
    <>
      <TextField label="Search" value={search} onChange={handleSearchChange} />
      <Button onClick={handleRefresh} sx={{ marginLeft: 2 }}>Refresh</Button>

      {status === 'failed' && <p>Error fetching data: {error}</p>}

      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'pink' }}>
              <StyledTableCell sx={{ fontWeight: 'bold', color: 'blue' }}>
                <TableSortLabel 
                sx={{
                  '&.Mui-active': {
                    color: '#ff5722', // Active sort label color
                  },
                  color: '#1976d2', // Default color
                  '&:hover': {
                    color: '#ff9800', // Hover color
                  }
                }}
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleRequestSort('name')}
                >
                  Name
                </TableSortLabel>
              </StyledTableCell>
              <StyledTableCell sx={{ fontWeight: 'bold', color: 'blue' }}>Image</StyledTableCell>
              <StyledTableCell sx={{ fontWeight: 'bold', color: 'blue' }}>
                <TableSortLabel
                sx={{
                  '&.Mui-active': {
                    color: '#ff5722', // Active sort label color
                  },
                  color: '#1976d2', // Default color
                  '&:hover': {
                    color: '#ff9800', // Hover color
                  }
                }}
                  active={orderBy === 'priceUsd'}
                  direction={orderBy === 'priceUsd' ? order : 'asc'}
                  onClick={() => handleRequestSort('priceUsd')}
                >
                  Price (USD)
                </TableSortLabel>
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCoins.length > 0 ? (
              filteredCoins.map((coin) => (
                <StyledTableRow
                  key={coin.id}
                  hover
                  onClick={() => handleRowClick(coin)}
                  sx={{ '&:hover': { backgroundColor: 'skyblue' } }}
                >
                  <StyledTableCell>{coin.name}</StyledTableCell>
                  <StyledTableCell>
                    <img
                      src={`https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`}
                      alt={coin.name}
                      style={{ width: '40px', height: '40px' }}
                    />
                  </StyledTableCell>
                  <StyledTableCell>{parseFloat(coin.priceUsd).toFixed(2)}</StyledTableCell>
                </StyledTableRow>
              ))
            ) : (
              <TableRow>
                <StyledTableCell colSpan={3}>No data available</StyledTableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        {editedCoin && (
          <div style={{ padding: '16px' }}>
            <TextField
              label="Name"
              name="name"
              fullWidth
              margin="dense"
              value={editedCoin.name || ''}
              onChange={handleEditChange}
            />
            <TextField
              label="Price"
              name="priceUsd"
              fullWidth
              margin="dense"
              value={editedCoin.priceUsd || ''}
              onChange={handleEditChange}
            />
            <Button
              onClick={handleEditSubmit}
              variant="contained"
              color="primary"
              sx={{ marginTop: '16px' }}
            >
              Save
            </Button>
          </div>
        )}
      </Dialog>
    </>
  );
}
