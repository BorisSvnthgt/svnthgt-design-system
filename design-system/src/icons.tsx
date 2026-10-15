import type {IconRegistry} from '@astryxdesign/core/Icon';
import {X, CaretDown, CaretLeft, CaretRight, CaretDoubleLeft, CaretDoubleRight, Check, CheckCircle, XCircle, Warning, Info, CalendarBlank, Clock, ArrowUpRight, List, DotsThree, MagnifyingGlass, UploadSimple, ArrowUp, ArrowDown, ArrowsDownUp, Funnel, EyeSlash, Columns, Copy, Checks, Wrench, Stop, Microphone} from '@phosphor-icons/react';

// Every built-in Astryx semantic icon is replaced with Phosphor.
// Stateful control indicators (switch thumb, checkbox tick) remain Astryx primitives.
const glyphs = {close:X, chevronDown:CaretDown, chevronLeft:CaretLeft, chevronRight:CaretRight,
  chevronsLeft:CaretDoubleLeft, chevronsRight:CaretDoubleRight, check:Check, success:CheckCircle,
  error:XCircle, warning:Warning, info:Info, calendar:CalendarBlank, clock:Clock,
  externalLink:ArrowUpRight, menu:List, moreHorizontal:DotsThree, search:MagnifyingGlass,
  upload:UploadSimple, arrowUp:ArrowUp, arrowDown:ArrowDown, arrowsUpDown:ArrowsDownUp,
  funnel:Funnel, eyeSlash:EyeSlash, viewColumns:Columns, copy:Copy, checkDouble:Checks,
  wrench:Wrench, stop:Stop, microphone:Microphone};
export const phosphorIcons = Object.fromEntries(Object.entries(glyphs).map(([name,Glyph]) =>
  [name,<Glyph weight="regular" size="100%" aria-hidden="true"/>])) as IconRegistry;
