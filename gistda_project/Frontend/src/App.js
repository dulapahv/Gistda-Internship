import React from 'react';

import { Banner, Footer, Visual } from './containers';

export default function App() {
  return (
    <div
      className={`flex flex-col w-full bg-white dark:bg-[#2c2c2c] text-[#212121]`}
    >
      <Banner />
      <Visual />
      <Footer />
    </div>
  );
}
