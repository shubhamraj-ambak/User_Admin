import React from "react";
import { ApolloProvider } from "@apollo/client/react";
import client from "./apolloClient";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import UserHome from "./pages/UserHome";
import AdminHome from "./pages/AdminHome";

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/user/home" element={<UserHome />} />
          <Route path="/admin/home" element={<AdminHome />} />
        </Routes>
      </Router>
    </ApolloProvider>
  );
}

export default App;