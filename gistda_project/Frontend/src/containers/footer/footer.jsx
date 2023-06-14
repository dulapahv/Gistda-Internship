import React from "react";

const Footer = () => {
    return (
        <div className="grid grid-rows-3 gap-2 sm:flex sm:flex-row bg-[#212121] px-8 py-4">
            <div className="sm:grow">
                <p className="font-kanit text-white font-light">
                    Made with <span className="text-[#f7588a]">❤</span> by
                    dulapahv
                </p>
            </div>
            <div className="sm:grow sm:text-center">
                <p className="font-kanit text-white font-light">
                    <span className="font-sans">©</span> 2023 Dulapah Vibulsanti
                </p>
            </div>
            <div className="sm:grow font-kanit text-white font-light sm:text-right underline decoration-[#f7588a]">
                <a
                    href="https://github.com/dulapahv"
                    target="_blank"
                    rel="noreferrer"
                >
                    github/dulapahv
                </a>
            </div>
        </div>
    );
};

export default Footer;
