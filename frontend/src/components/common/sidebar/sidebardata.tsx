import * as AiIcons from 'react-icons/ai';
import * as IoIcons from 'react-icons/io';
import { SlArrowRight, SlArrowDown } from 'react-icons/sl';
import { VscCircle } from "react-icons/vsc";
import { AiFillProduct } from "react-icons/ai";
import { GrUserWorker } from "react-icons/gr";
import { MdRedeem } from "react-icons/md";
import { MdCampaign } from "react-icons/md";
import { FaUserPlus } from "react-icons/fa6";
import { IconCashRegister } from '@tabler/icons-react';
import { IconLayoutDashboard } from '@tabler/icons-react';
import { IconScan } from '@tabler/icons-react';
import { IconBuildingBank } from '@tabler/icons-react';
import { IconCoins } from '@tabler/icons-react';
import RedeemIcon from '@mui/icons-material/Redeem'; 
import { IconHelpHexagon } from '@tabler/icons-react';
import { IoMdContact } from "react-icons/io";
// import { FaBorderAll } from "react-icons/fa6";
import BusinessIcon from '@mui/icons-material/Business';
// import CategoryIcon from '@mui/icons-material/Category';
import { IconLibraryPhoto } from '@tabler/icons-react';
import { IconLayoutKanban } from '@tabler/icons-react';
import { IconGardenCart } from '@tabler/icons-react';
import { IconGift } from '@tabler/icons-react';
import { SiSimplelogin } from "react-icons/si";




import '../../../assets/css/sidebar.css';


const iconStyle = { height: '8px', width: '8px', strokeWidth: '5rem' };



export const SidebarData = [
  {
    title: 'Admin Dashboard',
    path: '/admin-dashboard',
    icon: <AiIcons.AiFillHome className='sidebaricon' />,

  },
  {
    title: 'Projects',
    path: '/project',
    icon: <IconLayoutKanban className='sidebaricon' />,

  },
  {
    title: 'Product Dashboard',
    // path: '/admin-dashboard',
    icon: <AiFillProduct className='sidebaricon' />,
    iconClosed:<SlArrowRight style={iconStyle}  /> ,
    iconOpened: <SlArrowDown style={iconStyle}  />,

    subNav: [
      {
        title: 'Product Master',
        path: '/product-master',
        icon: <VscCircle />,
        cName: 'sub-nav'
      },
      {
        title: 'Product QR History',
        path: '/product-qr-history',
        icon: <VscCircle />,
        cName: 'sub-nav'
      },
    ]
  },

  {
    title: 'Gift Dashboard',
    icon: <IconGift className='sidebaricon' />,
    iconClosed:<SlArrowRight style={iconStyle}  /> ,
    iconOpened: <SlArrowDown style={iconStyle}  />,

    subNav: [
      {
        title: 'Gift Master',
        path: '/gift-master',
        icon: <VscCircle />,
        cName: 'sub-nav'
      },
  
    ]
  },
  {
    title: 'Product Catalogue',
    path: '/product-catagory',
    icon: <IconLibraryPhoto className='sidebaricon'  />
  },
  {
    title: 'Customer Dashboard',
    icon: <GrUserWorker className='sidebaricon'  />,

    iconClosed:<SlArrowRight  style={iconStyle} /> ,
    iconOpened: <SlArrowDown  style={iconStyle} />,

    subNav: [
      {
        title: 'Customer Registration',
        path: '/carpenter-registration',
        icon: <VscCircle />
      },
      {
        title: 'Customer Details',
        path: '/carpenter-details',
        icon: <VscCircle  />
      }
    ]
  },
  {
    title: 'Products Order',
    path: '/customer-product-orders',
    icon: <IconGardenCart className='sidebaricon'  />
  },
  {
    title: 'Reward Request',
    path: '/redeemption-request',
    icon: <MdRedeem className='sidebaricon'/>
  },
  {
    title: 'Transaction History',
    path: '/transaction-history',
    icon: <IconCashRegister className='sidebaricon' />
  },
  {
    title: 'Announcement',
    path: '/announcement',
    icon: <MdCampaign className='sidebaricon'  />
  },
  {
    title: 'Set Reward Points',
    path: '/set-reward-points',
    icon: <IconCoins className='sidebaricon'  />
  },
 

  {
    title: 'Set Company Address',
    path: '/company-address',
    icon: <BusinessIcon className='sidebaricon'  />
  },
  {
    title: 'Set Login Instructions',
    path: '/add-login-instructions',
    icon: <SiSimplelogin className='sidebaricon'  />
  },
  {
    title: "FAQ's",
    path: '/frequently-asked-question',
    icon: <IoIcons.IoMdHelpCircle className='sidebaricon'  />
  },
  
  {
    title: 'Add User',
    path: '/add-user',
    icon: <FaUserPlus  className='sidebaricon'/>
  },
  {
    title: 'Dashboard',
    path: '/carpenter-dashboard',
    icon: <IconLayoutDashboard  className='sidebaricon'/>
  },
  {
    title: 'QR Scanner',
    path: '/qr-scanner',
    icon: <IconScan  className='sidebaricon'/>
  },
  {
    title: 'Banking History',
    path: '/banking-history',
    icon: <IconBuildingBank  className='sidebaricon'/>
  },
  {
    title: 'Point History',
    path: '/point-history',
    icon: <IconCoins  className='sidebaricon'/>
  },
  {
    title: 'Redeem Request',
    path: '/redeem-request',
    icon: <RedeemIcon  className='sidebaricon'/>
  },
  {
    title: 'Help & Support',
    path: '/help-and-support',
    icon: <IconHelpHexagon  className='sidebaricon'/>
  },
  {
    title: 'Announcements',
    path: '/customer-announcement',
    icon: <MdCampaign className='sidebaricon'  />
  },
  {
    title: 'Contact',
    path: '/contact-us',
    icon: <IoMdContact className='sidebaricon'  />
  },

 
  
];
