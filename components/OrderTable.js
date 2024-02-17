"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  Box,
  CircularProgress,
  TableSortLabel, // Import TableSortLabel for sorting
} from "@mui/material";

const OrderTable = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(true); // State for loading
  const [orderBy, setOrderBy] = useState(""); // State for sorting column
  const [order, setOrder] = useState("asc"); // State for sorting order

  useEffect(() => {
    axios
      .get("/api/orders")
      .then((response) => {
        setOrders(response.data);
        setLoading(false); // Set loading to false when data arrives
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        setLoading(false); // Set loading to false in case of error
      });
  }, []);

  useEffect(() => {
    let filtered = orders.filter((order) =>
      order.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (startDate && endDate) {
      filtered = filtered.filter(
        (order) =>
          moment(order.date).isSameOrAfter(startDate) &&
          moment(order.date).isSameOrBefore(endDate)
      );
    }
    // Sort the filtered orders based on the selected column and order
    if (orderBy) {
      filtered.sort((a, b) => {
        if (order === "asc") {
          return a[orderBy].localeCompare(b[orderBy]);
        } else {
          return b[orderBy].localeCompare(a[orderBy]);
        }
      });
    }
    // Group by idtag and sum counts for Confirmed, Shipped, Cancelled, Pending, CodCount, OverseasCount, and OnlineCount
    const groupedAndSummedOrders = {};
    filtered.forEach((order) => {
      const {
        idtag,
        ConfirmedCount,
        ShippedCount,
        CancelledCount,
        PendingCount,
        CodCount,
        OverseasCount,
        OnlineCount,
        date,
      } = order;
      if (!groupedAndSummedOrders[idtag]) {
        groupedAndSummedOrders[idtag] = {
          idtag,
          product_name: order.product_name,
          ConfirmedCount: 0,
          ShippedCount: 0,
          CancelledCount: 0,
          PendingCount: 0,
          CodCount: 0,
          OverseasCount: 0,
          OnlineCount: 0,
          date: date,
        };
      }
      groupedAndSummedOrders[idtag].ConfirmedCount += ConfirmedCount;
      groupedAndSummedOrders[idtag].ShippedCount += ShippedCount;
      groupedAndSummedOrders[idtag].CancelledCount += CancelledCount;
      groupedAndSummedOrders[idtag].PendingCount += PendingCount;
      groupedAndSummedOrders[idtag].CodCount += CodCount;
      groupedAndSummedOrders[idtag].OverseasCount += OverseasCount;
      groupedAndSummedOrders[idtag].OnlineCount += OnlineCount;
    });
    setFilteredOrders(Object.values(groupedAndSummedOrders));
  }, [searchTerm, startDate, endDate, orders, orderBy, order]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStartDateChange = (e) => {
    const selectedStartDate = moment(e.target.value || new Date()).startOf(
      "day"
    );
    setStartDate(selectedStartDate);
  };

  const handleEndDateChange = (e) => {
    const selectedEndDate = moment(e.target.value || new Date()).endOf("day");
    setEndDate(selectedEndDate);
  };

  const handleSort = (column) => {
    const isAsc = orderBy === column && order === "asc";
    setOrderBy(column);
    setOrder(isAsc ? "desc" : "asc");
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <Box sx={{ display: "flex", marginBottom: "1rem" }}>
        <TextField
          label="Search by Product Name"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginRight: "1rem" }}
        />
        <TextField
          label="Start Date"
          type="date"
          variant="outlined"
          onChange={handleStartDateChange}
          defaultValue={moment().format("YYYY-MM-DD")}
          style={{ marginRight: "1rem" }}
        />
        <TextField
          label="End Date"
          type="date"
          variant="outlined"
          onChange={handleEndDateChange}
          defaultValue={moment().format("YYYY-MM-DD")}
        />
      </Box>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "idtag"}
                    direction={orderBy === "idtag" ? order : "asc"}
                    onClick={() => handleSort("idtag")}
                  >
                    Product Code
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "product_name"}
                    direction={orderBy === "product_name" ? order : "asc"}
                    onClick={() => handleSort("product_name")}
                  >
                    Product Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>Confirmed</TableCell>
                <TableCell>Shipped</TableCell>
                <TableCell>Cancelled</TableCell>
                <TableCell>Pending</TableCell>
                <TableCell>COD</TableCell>
                <TableCell>Overseas</TableCell>
                <TableCell>Online</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "date"}
                    direction={orderBy === "date" ? order : "asc"}
                    onClick={() => handleSort("date")}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredOrders
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((order, index) => (
                  <TableRow key={`${order.idtag}-${index}`}>
                    <TableCell>{order.idtag}</TableCell>
                    <TableCell>{order.product_name}</TableCell>
                    <TableCell>{order.ConfirmedCount}</TableCell>
                    <TableCell>{order.ShippedCount}</TableCell>
                    <TableCell>{order.CancelledCount}</TableCell>
                    <TableCell>{order.PendingCount}</TableCell>
                    <TableCell>{order.CodCount}</TableCell>
                    <TableCell>{order.OverseasCount}</TableCell>
                    <TableCell>{order.OnlineCount}</TableCell>
                    <TableCell>
                      {order.CodCount + order.OverseasCount + order.OnlineCount}
                    </TableCell>
                    <TableCell>
                      {moment(order.date).format("DD/MM/YYYY")}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 30]}
            component="div"
            count={filteredOrders.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      )}
    </div>
  );
};

export default OrderTable;
