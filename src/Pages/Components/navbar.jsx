import React from "react";
import "./nav.css";
import Nav from "react-bootstrap/Nav";

import {
  Navbar,
  Collapse,
  Typography,
  IconButton,
  List,
  ListItem,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import {
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const navListMenuItems = [
  {
    title: "Work Plan View",
    url: "",
  },
  {
    title: "Resource Histogram",
    url: "ResourceHistogram",
  },
  {
    title: "Sales Plan View",
    url: "",
  },
];

function NavListMenu() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const renderItems = navListMenuItems.map(({ title, url }, key) => (
    <a
      href={url}
      key={key}
      className={url === "" ? "cursor-not-allowed " : ""}
      style={url === "" ? { pointerEvents: "none", opacity: "0.5" } : {}}
    >
      <MenuItem
        className={
          url === ""
            ? "cursor-not-allowed  "
            : "flex flex-col   bg-[#333] active:bg-[#333] enabled:bg-[#333] focus:bg-[#333] hover:bg-[#333]  gap-1 rounded-lg"
        }
      >
        <div>
          <Typography
            variant="h6"
            color="blue-gray"
            className="flex text-white text-[1.2rem] font-bold whitespace-nowrap"
          >
            {title}
          </Typography>
        </div>
      </MenuItem>
    </a>
  ));

  return (
    <React.Fragment>
      <Menu
        open={isMenuOpen}
        handler={setIsMenuOpen}
        offset={{ mainAxis: 20 }}
        placement="bottom"
        className=""
        allowHover={false}
      >
        <MenuHandler>
          <Typography as="div" variant="h6" className=" mr-5 font-medium">
            <ListItem
              id="re"
              className="flex items-center  gap-1  font-medium bg-[#333] active:bg-[#333] enabled:bg-[#333] focus:bg-[#333] hover:bg-[#333] px-0 mx-1 text-white"
              selected={isMenuOpen || isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((cur) => !cur)}
            >
              <p className="text-white text-[1.2rem] px-2">Views</p>

              <ChevronDownIcon
                strokeWidth={2.5}
                className={`hidden text-white  ml-2 h-5 w-4 transition-transform lg:block ${
                  isMenuOpen ? "rotate-180" : ""
                }`}
              />

              <ChevronDownIcon
                strokeWidth={2.5}
                className={`block text-white  ml-2 h-5 w-4 transition-transform lg:hidden ${
                  isMobileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </ListItem>
          </Typography>
        </MenuHandler>
        <MenuList
          className="hidden drp5 bg-[#333] max-width=1% rounded-xl lg:block"
          id="head"
        >
          <ul className="flex  flex-col w-full gap-y-2 bg- outline-0">
            {renderItems}
          </ul>
        </MenuList>
      </Menu>
      <div className="block  lg:hidden">
        <Collapse open={isMobileMenuOpen}>{renderItems}</Collapse>
      </div>
    </React.Fragment>
  );
}

const navListMenuItems2 = [
  {
    title: "Project Description",
    url: "",
  },
  {
    title: "Estimate Hours",
    url: "",
  },
  {
    title: "Project Data Entry",
    url: "ProjectDataEntry",
  },
  {
    title: "Operatives Allocation",
    url: "OperativesAllocation",
  },
];

function NavListMenu2() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const renderItems = navListMenuItems2.map(({ title, url }, key) => (
    <a
      href={url}
      key={key}
      className={url === "" ? "cursor-not-allowed " : ""}
      style={url === "" ? { pointerEvents: "none", opacity: "0.5" } : {}}
    >
      <MenuItem
        className={`${
          url === ""
            ? "cursor-not-allowed "
            : "flex flex-col bg-[#333] hover:bg-[#333] focus:bg-[#333] px-1.5 mx-2 gap-3 rounded-lg"
        }`}
      >
        <div>
          <Typography
            variant="h1"
            color="blue-gray"
            className="flex text-white text-[1.2rem] font-bold whitespace-nowrap"
          >
            {title}
          </Typography>
        </div>
      </MenuItem>
    </a>
  ));

  return (
    <React.Fragment>
      <Menu
        open={isMenuOpen}
        handler={setIsMenuOpen}
        offset={{ mainAxis: 20 }}
        placement="bottom"
        allowHover={false}
      >
        <MenuHandler>
          <Typography as="div" variant="h5" className=" mr-5 font-medium">
            <ListItem
              id="red rd"
              className="flex items-center gap-1  font-medium bg-[#333] active:bg-[#333] enabled:bg-[#333] focus:bg-[#333] hover:bg-[#333] px-0 mx-2 text-white"
              selected={isMenuOpen || isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((cur) => !cur)}
            >
              <p className="text-white text-[1.2rem] whitespace-nowrap ">
                Work Planning Data
              </p>

              <ChevronDownIcon
                strokeWidth={2.5}
                className={`text-white hidden  ml-2 h-5 w-4 transition-transform lg:block ${
                  isMenuOpen ? "rotate-180" : ""
                }`}
              />
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`block text-white  ml-2 h-5 w-4 transition-transform lg:hidden ${
                  isMobileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </ListItem>
          </Typography>
        </MenuHandler>
        <MenuList className="hidden drp menu-list  max-w-screen-xl bg-[#333]  rounded-xl lg:block">
          <ul className="grid  grid-cols-1 bg-[#333] gap-y-2 outline-none outline-0">
            {renderItems}
          </ul>
        </MenuList>
      </Menu>
      <div className="block lg:hidden">
        <Collapse open={isMobileMenuOpen}>{renderItems}</Collapse>
      </div>
    </React.Fragment>
  );
}

const navListMenuItems3 = [
  {
    title: " DL Input Hours",
    url: "",
  },
  {
    title: "Project Progress",
    url: "",
  },
  {
    title: "User Availability",
    url: "/userAvailability",
  },
];

function NavListMenu3() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const renderItems = navListMenuItems3.map(({ title, url }, key) => (
    <a
      href={url}
      key={key}
      className={url === "" ? "cursor-not-allowed " : ""}
      style={url === "" ? { pointerEvents: "none", opacity: "0.5" } : {}}
    >
      <MenuItem
        className={
          url === ""
            ? "cursor-not-allowed "
            : "flex flex-col  bg-[#333] active:bg-[#333] enabled:bg-[#333] focus:bg-[#333] hover:bg-[#333] px-1.5 mx-2 gap-3 rounded-lg"
        }
      >
        <div>
          <Typography
            variant="h6"
            color="blue-gray"
            className="flex text-white text-[1.2rem] font-bold whitespace-nowrap"
          >
            {title}
          </Typography>
        </div>
      </MenuItem>
    </a>
  ));

  return (
    <React.Fragment>
      <Menu
        open={isMenuOpen}
        handler={setIsMenuOpen}
        offset={{ mainAxis: 20 }}
        placement="bottom"
        allowHover={false}
      >
        <MenuHandler>
          <Typography as="div" variant="h5" className="font-medium  mr-5">
            <ListItem
              id="rd"
              className="flex items-center gap-2 font-medium bg-[#333] active:bg-[#333] enabled:bg-[#333] focus:bg-[#333] hover:bg-[#333] px-0 mx-2 text-white"
              selected={isMenuOpen || isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((cur) => !cur)}
            >
              <p className="text-white text-[1.2rem]">User's Data Entry</p>

              <ChevronDownIcon
                strokeWidth={2.5}
                className={`hidden text-white  ml-2 h-5 w-4 transition-transform lg:block ${
                  isMenuOpen ? "rotate-180" : ""
                }`}
              />
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`block text-white  ml-2 h-5 w-4 transition-transform lg:hidden ${
                  isMobileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </ListItem>
          </Typography>
        </MenuHandler>
        <MenuList className="hidden drp2 max-w-screen-xl bg-[#333]  rounded-xl lg:block">
          <ul className="grid grid-cols-1 gap-y-2 bg-[#333] outline-none outline-0">
            {renderItems}
          </ul>
        </MenuList>
      </Menu>
      <div className="block lg:hidden">
        <Collapse open={isMobileMenuOpen}>{renderItems}</Collapse>
      </div>
    </React.Fragment>
  );
}

const navListMenuItems4 = [
  {
    title: " Access Permissions",
    url: "",
  },
  {
    title: "Role",
    url: "",
  },
  {
    title: "New Feature Popup",
    url: "",
  },
  {
    title: "Dashbored",
    url: "",
  },
  {
    title: "Logout",
    url:"/Login"
  },
];

function NavListMenu4() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const renderItems = navListMenuItems4.map(({ title, url }, key) => (
    <a
      href={url}
      key={key}
      className={url === "" ? "cursor-not-allowed " : ""}
      style={url === "" ? { pointerEvents: "none", opacity: "0.5" } : {}}
    >
      <MenuItem
        className={
          url === ""
            ? "cursor-not-allowed "
            : "flex flex-col bg-[#333] active:bg-[#333] enabled:bg-[#333] focus:bg-[#333] hover:bg-[#333] px-1.5 mx-2 gap-3 rounded-lg"
        }
      >
        {" "}
        <div>
          <Typography
            variant="h6 "
            color="blue-gray"
            className="flex text-white text-[1.2rem] font-bold whitespace-nowrap"
          >
            {title}
          </Typography>
        </div>
      </MenuItem>
    </a>
  ));

  return (
    <React.Fragment>
      <Menu
        open={isMenuOpen}
        handler={setIsMenuOpen}
        offset={{ mainAxis: 20 }}
        placement="bottom"
        allowHover={false}
      >
        <MenuHandler>
          <Typography as="div" variant="h5" className="font-medium">
            <ListItem
              id="rd"
              className="flex items-center gap-2 ml-2 font-medium bg-[#333] active:bg-[#333] enabled:bg-[#333] focus:bg-[#333] hover:bg-[#333] text-white"
              selected={isMenuOpen || isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((cur) => !cur)}
            >
              <p className="text-white text-[1.2rem]">Admin</p>

              <ChevronDownIcon
                strokeWidth={2.5}
                className={`hidden text-white ml-2 h-5 w-4 transition-transform lg:block ${
                  isMenuOpen ? "rotate-180" : ""
                }`}
              />
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`block text-white  ml-2 h-5 w-4 transition-transform lg:hidden ${
                  isMobileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </ListItem>
          </Typography>
        </MenuHandler>
        <MenuList className="hidden drp3 bg-[#333] max-w-screen-xl rounded-xl lg:block">
          <ul className="grid grid-cols-1 bg-[#333] text-white gap-y-2 outline-none outline-0">
            {renderItems}
          </ul>
        </MenuList>
      </Menu>
      <div className="block lg:hidden">
        <Collapse open={isMobileMenuOpen}>{renderItems}</Collapse>
      </div>
    </React.Fragment>
  );
}

function NavList() {
  return (
    <List className="mb-6 bg-red  pl-[10px] lg:mt-0   lg:mb-0 lg:flex-row lg:p-1">
      <Typography
        as="a"
        href="#"
        variant="h5"
        color="blue-gray"
        className="font-sm"
      >
        <Nav.Link
          id="hm"
          className="flex mt-3 gap-2 ml-[20px] bg-[#333] w-5 active:bg-[#333] enabled:bg-[#333] focus:bg-[#333] hover:bg-[#333] text-white"
          href="#
            "
        >
          Home
        </Nav.Link>
      </Typography>
      <NavListMenu />
      <NavListMenu2 />
      <NavListMenu3 />
      <NavListMenu4 />
    </List>
  );
}

export function NavbarWithMegaMenu() {
  const [openNav, setOpenNav] = React.useState(false);

  React.useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpenNav(false)
    );
  }, []);

  return (
    <div className="bg-[#333] sm:w-[100%] font-size-[15px] hdr fixed-header">
      <Navbar
        color="black"
        className="p-0 bg-[#333] "
        style={{ fontFamily: "Helvetica Neue,Helvetica,Arial" }}
      >
        <div className="flex bg-[#333] ">
          <div className="hidden bg-[#333] lg:block">
            <NavList />
          </div>
          <IconButton
            variant="text"
            color="blue-gray"
            className="lg:hidden p-10 pt-14"
            onClick={() => setOpenNav(!openNav)}
          >
            {openNav ? (
              <XMarkIcon className="h-12 w-12" strokeWidth={2} />
            ) : (
              <Bars3Icon className="h-12 w-12" strokeWidth={2} />
            )}
          </IconButton>
          <span
            className=" ml-5 mt-3 text-black border-black flex flex-row rounded-full bg-white  info_icon"
            dangerouslySetInnerHTML={{
              __html: `
      <svg  classname="h-[35px] w-[35px] " viewBox="-0.48 -0.48 16.96 16.96" xmlns="http://www.w3.org/2000/svg" fill="bl" class="bi bi-info-circle-fill" stroke="bl">
        <g id="SVGRepo_bgCarrier" stroke-width="0">
          <rect x="-0.48" y="-0.48" width="16.96" height="16.96" rx="8.48" fill="white" stroke-width="0"></rect>
        </g>
        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
        <g id="SVGRepo_iconCarrier">
          <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"></path>
        </g>
      </svg>
    `,
            }}
          />
        </div>
        <Collapse open={openNav}>
          <NavList />
          {/* <div className="flex w-full flex-nowrap items-center gap-2 lg:hidden">
          <Button variant="outlined" size="sm" color="blue-gray" fullWidth>
            Log In
          </Button>
          <Button variant="gradient" size="sm" fullWidth>
            Sign In
          </Button>
        </div> */}
        </Collapse>
      </Navbar>
    </div>
  );
}
