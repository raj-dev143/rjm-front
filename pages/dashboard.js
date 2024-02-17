// pages/dashboard.js
import React from "react";
import { useRouter } from "next/router";
import OrderTable from "@/components/OrderTable";
import Header from "@/components/Header";

const DashboardPage = () => {
  const router = useRouter();

  return (
    <div>
      <Header />
      <OrderTable />
    </div>
  );
};

export default DashboardPage;
