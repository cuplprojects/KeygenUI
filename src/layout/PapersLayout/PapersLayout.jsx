// NOT IN USE

import React from 'react';
import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";

const PapersLayout = () => {
    const location = useLocation();
    const [filters, setFilters] = useState({ search: "", sort: "" });

    // Clear state if navigating away from papers-related routes
    if (!location.pathname.startsWith("/Masters/papers")) {
        setFilters({ search: "", sort: "" });
    }

    return <Outlet context={{ filters, setFilters }} />;
};

export default PapersLayout;
