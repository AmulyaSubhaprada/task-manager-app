import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import { User, Moon, SunMoon } from 'lucide-react';

const Header = ({ darkMode, handleToggleTheme }) => {
  return (
    <header className={darkMode?"darkmode_header":"header"}>
      <div className="logo">Task Manager</div>
      <div className="header-icons">
        <IconButton color="inherit">
          <User />
        </IconButton>
        <IconButton color="inherit" onClick={handleToggleTheme}>
          {darkMode ? <SunMoon /> : <Moon />}
        </IconButton>
      </div>
    </header>
  );
};

export default Header;
