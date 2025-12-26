import React from 'react';
import { AspectRatio, Verbosity, StyleOption, ToneOption } from './types';
import { 
  Palette, 
  Box, 
  PenTool, 
  Layout, 
  Monitor, 
  Coffee,
  Smile,
  BookOpen,
  Briefcase,
  Cpu,
  Clapperboard,
  Gamepad2,
  Ghost,
  Sticker,
  Edit3,
  RectangleHorizontal,
  RectangleVertical,
  Square,
  PartyPopper,
  HeartHandshake,
  Sparkles,
  Sun
} from 'lucide-react';

export const CARTOON_STYLES: StyleOption[] = [
  // New & Requested
  { 
    id: 'sticker', 
    label: 'Sticker', 
    description: 'ขอบขาวหนา ไดคัท สดใส',
    icon: <Sticker className="w-6 h-6" />
  },
  // Existing
  { 
    id: 'flat_design', 
    label: 'Flat Design', 
    description: 'เรียบง่าย ทันสมัย สบายตา',
    icon: <Layout className="w-6 h-6" />
  },
  { 
    id: '3d_cute', 
    label: '3D Cute', 
    description: 'น่ารัก นุ่มนวล มีมิติ',
    icon: <Box className="w-6 h-6" />
  },
  { 
    id: '3d_kawaii', 
    label: '3D Kawaii', 
    description: 'สีพาสเทล หวานแหวว ฟรุ้งฟริ้ง',
    icon: <Smile className="w-6 h-6" />
  },
  { 
    id: 'pixar_style', 
    label: '3D Pixar Style', 
    description: 'คุณภาพสูง แสงเงาแบบภาพยนตร์',
    icon: <Clapperboard className="w-6 h-6" />
  },
  { 
    id: '3d_chibi', 
    label: '3D Chibi', 
    description: 'ตัวจิ๋ว หัวโต สามมิติ',
    icon: <Gamepad2 className="w-6 h-6" />
  },
  { 
    id: 'chibi_2d', 
    label: 'Chibi (2D)', 
    description: 'การ์ตูนหัวโต ตัวเล็ก น่ารัก',
    icon: <Ghost className="w-6 h-6" />
  },
  { 
    id: 'manga', 
    label: 'Manga Style', 
    description: 'ลายเส้นญี่ปุ่น ขาวดำ หรือสีจาง',
    icon: <BookOpen className="w-6 h-6" />
  },
  { 
    id: 'hand_drawn', 
    label: 'Hand Drawn', 
    description: 'ลายเส้นอิสระ เป็นกันเอง',
    icon: <PenTool className="w-6 h-6" />
  },
  { 
    id: 'isometric_diagram', 
    label: 'Diagram / Isometric', 
    description: 'ภาพตัดขวาง แผนภาพเชิงเทคนิค',
    icon: <Cpu className="w-6 h-6" />
  },
  { 
    id: 'serious_editorial', 
    label: 'Serious / Editorial', 
    description: 'ทางการ น่าเชื่อถือ ข่าวสาร',
    icon: <Briefcase className="w-6 h-6" />
  },
  { 
    id: 'corporate_memphis', 
    label: 'Corporate', 
    description: 'ตัวการ์ตูนขายาว สีสันสดใส',
    icon: <Monitor className="w-6 h-6" />
  },
  { 
    id: 'retro_pop', 
    label: 'Retro Pop', 
    description: 'ย้อนยุค สีจัดจ้าน ป๊อปอาร์ต',
    icon: <Palette className="w-6 h-6" />
  },
  { 
    id: 'minimal_line', 
    label: 'Minimal Line', 
    description: 'ลายเส้นล้วน มินิมอล',
    icon: <Coffee className="w-6 h-6" />
  },
  // Custom moved to end
  { 
    id: 'custom', 
    label: 'Custom', 
    description: 'กำหนดสไตล์เองตามต้องการ',
    icon: <Edit3 className="w-6 h-6" />
  },
];

export const ASPECT_RATIOS = [
  { value: AspectRatio.PORTRAIT, label: 'แนวตั้ง (9:16)', icon: <RectangleVertical className="w-6 h-6" />, desc: 'เหมาะสำหรับ TikTok, Reels, Story' },
  { value: AspectRatio.SQUARE, label: 'จัตุรัส (1:1)', icon: <Square className="w-6 h-6" />, desc: 'เหมาะสำหรับ Instagram, Facebook Post' },
  { value: AspectRatio.LANDSCAPE, label: 'แนวนอน (16:9)', icon: <RectangleHorizontal className="w-6 h-6" />, desc: 'เหมาะสำหรับ Presentation, YouTube' },
];

export const VERBOSITY_LEVELS = [
  { 
    value: Verbosity.CONCISE, 
    label: 'กระชับ (Concise)', 
    desc: 'เนื้อหาเน้นเด็กประถม เข้าใจง่าย ตัวหนังสือใหญ่ เน้นภาพประกอบ' 
  },
  { 
    value: Verbosity.STANDARD, 
    label: 'มาตรฐาน (Standard)', 
    desc: 'เนื้อหาสำหรับนักเรียนมัธยม มีสาระความรู้ สมดุลภาพและข้อความ' 
  },
  { 
    value: Verbosity.DETAILED, 
    label: 'ละเอียด (Detailed)', 
    desc: 'เนื้อหาสำหรับนักศึกษามหาวิทยาลัย ข้อมูลเชิงลึก วิชาการ สถิติแน่น' 
  },
];

export const TONE_OPTIONS: ToneOption[] = [
  { id: 'fun', label: 'สนุกสนาน (Fun)', icon: <PartyPopper className="w-6 h-6" /> },
  { id: 'friendly', label: 'เป็นกันเอง (Friendly)', icon: <HeartHandshake className="w-6 h-6" /> },
  { id: 'bright', label: 'สดใส (Bright)', icon: <Sun className="w-6 h-6" /> },
  { id: 'formal', label: 'ทางการ (Formal)', icon: <Briefcase className="w-6 h-6" /> },
];