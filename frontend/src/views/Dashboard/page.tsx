"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

function DashboardView() {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-screen flex-col p-4">
      <div className="w-full max-w-md mx-auto space-y-6">
        Hello World
      </div>
    </main>
  );
}

export default DashboardView;
