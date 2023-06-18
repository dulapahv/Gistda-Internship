import React from "react";

function Footer() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-8 pb-3 pt-2 bg-[#f7588a]">
      <div className="flex-1 text-left">
        <p className="font-kanit text-white font-light">
          Made with <span className="text-[#ffffff]">❤</span> by dulapahv
        </p>
      </div>
      <div className="flex-1 text-center">
        <p className="font-kanit text-white font-light">
          <span className="font-sans">©</span> 2023 Dulapah Vibulsanti
        </p>
      </div>
      <div className="flex-1 font-kanit text-white font-light sm:text-right underline decoration-[#f7588a] text-right">
        <a href="https://github.com/dulapahv" target="_blank" rel="noreferrer">
          github/dulapahv
        </a>
      </div>
    </div>
  );
}

export default Footer;
