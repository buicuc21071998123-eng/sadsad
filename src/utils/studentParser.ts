import { Student, StudentRole, Gender } from '../types';
import { generateUnique5DigitCode } from './imageUtils';
import * as XLSX from 'xlsx';

export interface ParsedStudentDraft {
  id: string;
  stt: number;
  name: string;
  gender: Gender;
  group: 1 | 2 | 3 | 4;
  role: StudentRole;
  birthday?: string;
  parentPhone?: string;
  flowerPoints: number;
  personalTarget?: string;
  talents?: string;
  notes?: string;
  // Duplicate inspection
  isDuplicateInImport?: boolean;
  isDuplicateInClass?: boolean;
  duplicateCount?: number;
  originalRaw?: string;
}

export const VALID_ROLES: StudentRole[] = [
  'Học sinh',
  'Lớp trưởng',
  'Lớp phó học tập',
  'Lớp phó văn thể mỹ',
  'Lớp phó lao động',
  'Tổ trưởng Tổ 1',
  'Tổ trưởng Tổ 2',
  'Tổ trưởng Tổ 3',
  'Tổ trưởng Tổ 4',
  'Tổ phó Tổ 1',
  'Tổ phó Tổ 2',
  'Tổ phó Tổ 3',
  'Tổ phó Tổ 4',
  'Bí thư chi đội',
  'Ủy viên ban chỉ huy chi đội',
  'Quản ca',
];

/**
 * Normalizes Vietnamese name: removes extra spaces, trims
 */
export function cleanStudentName(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if a string looks like a header line rather than a real student name
 */
export function isHeaderOrIgnoredLine(line: string): boolean {
  const normalized = line.toLowerCase().trim();
  if (!normalized || normalized.length < 2) return true;

  // Title keywords
  const ignorePhrases = [
    'danh sách học sinh',
    'danh sach hoc sinh',
    'sổ theo dõi',
    'so theo doi',
    'bảng thi đua',
    'bang thi dua',
    'năm học',
    'nam hoc',
    'lớp:',
    'lop:',
    'gvcn:',
    'giáo viên chủ nhiệm',
    'trường tiểu học',
    'truong tieu hoc',
    'họ và tên',
    'ho va ten',
    'stt\thọ',
    'stt , họ',
    'stt;họ',
    'họ tên\tgiới tính',
  ];

  if (ignorePhrases.some((p) => normalized.startsWith(p) || normalized === p)) {
    return true;
  }

  // Exact header line patterns like "STT | Họ và Tên | Giới tính | Tổ"
  if (
    (normalized.includes('stt') || normalized.includes('số tt')) &&
    (normalized.includes('tên') || normalized.includes('name') || normalized.includes('họ'))
  ) {
    return true;
  }

  return false;
}

/**
 * Cleans leading STT and bullet points from pasted text line
 * e.g., "1. Nguyễn Văn An" -> "Nguyễn Văn An"
 * "01/ Trần Thị Bích" -> "Trần Thị Bích"
 * "STT 5: Lê Văn C" -> "Lê Văn C"
 * "- [02] Phạm Thị D" -> "Phạm Thị D"
 * "• 1) Hoàng Văn E" -> "Hoàng Văn E"
 */
export function stripLeadingNumbering(raw: string): { cleaned: string; detectedStt?: number } {
  let text = raw.trim();
  let detectedStt: number | undefined = undefined;

  // Pattern 1: STT prefix e.g. "STT 01:", "STT. 1", "STT: 1 -"
  text = text.replace(/^stt\s*[:\.\-]?\s*(\d+)?\s*[:\.\-]?\s*/i, (match, p1) => {
    if (p1) detectedStt = parseInt(p1, 10);
    return '';
  });

  // Pattern 2: Leading bullets or bracketed numbers e.g. "- ", "* ", "• ", "[1] ", "(1) "
  text = text.replace(/^[\-\*\•\+\>\#\~\_]+\s*/, '');
  text = text.replace(/^\[\s*(\d+)\s*\]\s*[\:\.\-]?\s*/, (match, p1) => {
    if (p1 && detectedStt === undefined) detectedStt = parseInt(p1, 10);
    return '';
  });

  // Pattern 3: Leading numbers e.g. "1.", "01/", "1)", "1 - ", "1: ", "1 "
  const numMatch = text.match(/^(\d{1,3})\s*[\.\/\)\:\-\_]?\s*(.*)$/);
  if (numMatch && numMatch[2] && numMatch[2].length > 1) {
    // Make sure we didn't just strip a phone number
    if (numMatch[1].length <= 3) {
      if (detectedStt === undefined) detectedStt = parseInt(numMatch[1], 10);
      text = numMatch[2];
    }
  }

  return {
    cleaned: text.trim(),
    detectedStt,
  };
}

/**
 * Accurately parses gender from text, handling Vietnamese accents, normalization,
 * and punctuation boundaries without being broken by JavaScript's ASCII-only \b regex.
 */
export function parseGender(text?: string): Gender | undefined {
  if (!text) return undefined;
  const raw = text.trim();
  if (!raw) return undefined;
  const lower = raw.toLowerCase();
  const normalized = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

  const delimiter = '(?:^|[\\s()\\[\\]{}<>,;:_\\/|.~+-])';
  const endDelimiter = '(?=$|[\\s()\\[\\]{}<>,;:_\\/|.~+-])';

  // Check Female first: nữ, nu, gái, gai, female, f
  const femaleRegex = new RegExp(`${delimiter}(?:nữ|nu|gái|gai|female|f)${endDelimiter}`, 'i');
  if (femaleRegex.test(lower) || femaleRegex.test(normalized)) {
    return 'nu';
  }

  // Check Male: nam, trai, male, m
  const maleRegex = new RegExp(`${delimiter}(?:nam|trai|male|m)${endDelimiter}`, 'i');
  if (maleRegex.test(lower) || maleRegex.test(normalized)) {
    return 'nam';
  }

  return undefined;
}

/**
 * Smart Vietnamese middle name gender inference fallback
 */
export function inferGenderFromVietnameseName(name: string): Gender | undefined {
  if (!name) return undefined;
  const lower = name.toLowerCase();
  const normalized = lower
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');

  // "Thị" in Vietnamese middle names is almost exclusively female
  if (/(?:^|\s)thị(?:\s|$)/i.test(lower) || /(?:^|\s)thi(?:\s|$)/i.test(normalized)) {
    return 'nu';
  }

  // "Văn" in Vietnamese middle names is traditionally male
  if (/(?:^|\s)văn(?:\s|$)/i.test(lower) || /(?:^|\s)van(?:\s|$)/i.test(normalized)) {
    return 'nam';
  }

  return undefined;
}

/**
 * Extracts meta information embedded in parentheses or trailing text
 * e.g. "Nguyễn Thị Mai (Nữ - Tổ 2 - 0987654321)"
 * or "Trần Ngọc Bảo An (Nữ - Tổ 1 - 0912345678)"
 */
export function extractEmbeddedMeta(text: string): {
  cleanName: string;
  gender?: Gender;
  group?: 1 | 2 | 3 | 4;
  phone?: string;
  role?: StudentRole;
  birthday?: string;
} {
  let name = text;
  let gender: Gender | undefined = undefined;
  let group: 1 | 2 | 3 | 4 | undefined = undefined;
  let phone: string | undefined = undefined;
  let role: StudentRole | undefined = undefined;
  let birthday: string | undefined = undefined;

  // 1. Check if there are brackets / parentheses e.g. "(Nữ - Tổ 1 - 0912345678)" or "[Nam, Tổ 2]"
  const bracketMatch = name.match(/[\(\[\{]([^\)\]\}]+)[\)\]\}]/);
  if (bracketMatch) {
    const metaBlock = bracketMatch[1];

    // Extract phone from bracket
    const phoneMatch = metaBlock.match(/(?:sđt|đt|tel|phone|lh)?\s*[:\-\s]?\s*(0[235789]\d{8,9})\b/i);
    if (phoneMatch) {
      phone = phoneMatch[1];
    }

    // Extract birthday from bracket
    const bdayMatch = metaBlock.match(/\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})\b/);
    if (bdayMatch) {
      birthday = bdayMatch[1];
    }

    // Extract Gender from bracket
    gender = parseGender(metaBlock);

    // Extract Group from bracket (Tổ 1..4, Nhóm 1..4, T1..T4)
    const grpMatch = metaBlock.match(/\b(?:tổ|to|nhóm|nhom|t|group)\s*([1-4])\b/i);
    if (grpMatch) {
      group = parseInt(grpMatch[1], 10) as 1 | 2 | 3 | 4;
    }

    // Extract Role from bracket
    for (const r of VALID_ROLES) {
      if (r !== 'Học sinh' && new RegExp(`(?:^|[\\s\\-\\:\\,\\;])${r}(?:$|[\\s\\-\\:\\,\\;])`, 'i').test(metaBlock)) {
        role = r;
        break;
      }
    }

    // Remove the bracket block from name
    name = name.replace(bracketMatch[0], ' ');
  }

  // 2. Extract remaining items outside brackets if not yet found
  if (!phone) {
    const phoneMatch = name.match(/(?:sđt|đt|tel|phone|lh)?\s*[:\-\s]?\s*(0[235789]\d{8,9})\b/i);
    if (phoneMatch) {
      phone = phoneMatch[1];
      name = name.replace(phoneMatch[0], ' ');
    }
  }

  if (!birthday) {
    const bdayMatch = name.match(/\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})\b/);
    if (bdayMatch) {
      birthday = bdayMatch[1];
      name = name.replace(bdayMatch[0], ' ');
    }
  }

  // If line was hyphen / slash / pipe separated (e.g. "Lê Tuấn Kiệt - Nam - Tổ 2")
  if (name.includes(' - ') || name.includes(' | ') || name.includes(' / ') || name.includes(' ; ')) {
    const parts = name.split(/\s*[\-\|\/\;]\s*/).map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      name = parts[0];
      const restText = parts.slice(1).join(' ');

      if (!gender) {
        gender = parseGender(restText);
      }

      if (!group) {
        const grpMatch = restText.match(/\b(?:tổ|to|nhóm|nhom|t|group)\s*([1-4])\b/i);
        if (grpMatch) {
          group = parseInt(grpMatch[1], 10) as 1 | 2 | 3 | 4;
        }
      }

      if (!role) {
        for (const r of VALID_ROLES) {
          if (r !== 'Học sinh' && new RegExp(`(?:^|[\\s\\-\\:\\,\\;])${r}(?:$|[\\s\\-\\:\\,\\;])`, 'i').test(restText)) {
            role = r;
            break;
          }
        }
      }
    }
  }

  // If role is still not found, check if any role is written at end of line
  if (!role) {
    for (const r of VALID_ROLES) {
      if (r !== 'Học sinh' && new RegExp(`(?:^|[\\s\\-\\:\\,\\;])${r}(?:$|[\\s\\-\\:\\,\\;])`, 'i').test(name)) {
        role = r;
        name = name.replace(new RegExp(`(?:^|[\\s\\-\\:\\,\\;])${r}(?:$|[\\s\\-\\:\\,\\;])`, 'gi'), ' ');
        break;
      }
    }
  }

  // Clean remaining parenthesis, brackets, hyphens, colons left over
  name = name
    .replace(/[\(\)\[\]\{\}\<\>]/g, ' ')
    .replace(/[\:\-\_\|\,\;]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // If gender is still not found, check middle name inference
  if (!gender) {
    gender = inferGenderFromVietnameseName(name);
  }

  return {
    cleanName: name,
    gender,
    group,
    phone,
    role,
    birthday,
  };
}

/**
 * Checks and marks duplicates in a draft list and against existing class students
 */
export function enrichDuplicateFlags(
  drafts: ParsedStudentDraft[],
  existingStudents: Student[] = []
): ParsedStudentDraft[] {
  const existingNamesSet = new Set(
    existingStudents.map((s) => cleanStudentName(s.name).toLowerCase())
  );

  // Count occurrences inside drafts
  const importNameCounts = new Map<string, number>();
  drafts.forEach((d) => {
    const key = cleanStudentName(d.name).toLowerCase();
    importNameCounts.set(key, (importNameCounts.get(key) || 0) + 1);
  });

  return drafts.map((d) => {
    const key = cleanStudentName(d.name).toLowerCase();
    const countInImport = importNameCounts.get(key) || 1;
    const isDupImport = countInImport > 1;
    const isDupClass = existingNamesSet.has(key);

    return {
      ...d,
      isDuplicateInImport: isDupImport,
      isDuplicateInClass: isDupClass,
      duplicateCount: countInImport,
    };
  });
}

/**
 * Intelligent parser for text pasted from Word, Excel, Zalo, Web, Notepad
 */
export function parseFlexibleStudentText(
  rawText: string,
  existingStudents: Student[] = []
): ParsedStudentDraft[] {
  if (!rawText || !rawText.trim()) return [];

  const rawLines = rawText.split(/\r?\n/).map((l) => l.trim());
  const validDrafts: ParsedStudentDraft[] = [];

  let lineCounter = 0;

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i];
    if (!rawLine || isHeaderOrIgnoredLine(rawLine)) continue;

    // Check if line contains tab (\t), semicolon (;), pipe (|), or comma (,) with multiple items
    let cols: string[] = [];
    if (rawLine.includes('\t')) {
      cols = rawLine.split('\t').map((c) => c.trim());
    } else if (rawLine.includes(';') && rawLine.split(';').length >= 2) {
      cols = rawLine.split(';').map((c) => c.trim());
    } else if (rawLine.includes('|') && rawLine.split('|').length >= 2) {
      cols = rawLine.split('|').map((c) => c.trim());
    } else if (rawLine.includes(',') && rawLine.split(',').length >= 3) {
      cols = rawLine.split(',').map((c) => c.trim());
    }

    lineCounter++;
    const defaultGroup = ((validDrafts.length % 4) + 1) as 1 | 2 | 3 | 4;

    if (cols.length >= 2) {
      // MULTI-COLUMN LINE PARSING (e.g. from Excel / Word table)
      let parsedStt: number = lineCounter;
      let parsedName = '';
      let parsedGender: Gender = 'nam';
      let parsedGroup: 1 | 2 | 3 | 4 = defaultGroup;
      let parsedRole: StudentRole = 'Học sinh';
      let parsedPoints = 0;
      let parsedPhone: string | undefined = undefined;
      let parsedBirthday: string | undefined = undefined;

      // Check if col 0 is numeric STT
      const col0IsNum = /^\d{1,3}$/.test(cols[0]);
      let nameColIdx = col0IsNum ? 1 : 0;
      if (col0IsNum) parsedStt = parseInt(cols[0], 10);

      // Check if there is separate "Họ đệm" + "Tên" in next column
      const possibleLastName = cols[nameColIdx] || '';
      const possibleFirstName = cols[nameColIdx + 1] || '';

      // If col 1 and col 2 look like Last Name + First Name (e.g., "Nguyễn Văn" and "An")
      if (
        possibleLastName &&
        possibleFirstName &&
        !/\d/.test(possibleFirstName) &&
        possibleFirstName.length < 15 &&
        !['nam', 'nữ', 'nu', 'tổ 1', 'tổ 2', 'tổ 3', 'tổ 4'].includes(possibleFirstName.toLowerCase())
      ) {
        parsedName = cleanStudentName(`${possibleLastName} ${possibleFirstName}`);
        // shift subsequent column index
        nameColIdx += 1;
      } else {
        parsedName = cleanStudentName(possibleLastName);
      }

      // Check remaining columns for Gender, Group, Role, Points, Phone
      for (let c = nameColIdx + 1; c < cols.length; c++) {
        const val = cols[c];
        if (!val) continue;
        const low = val.toLowerCase();

        // Gender
        const colGender = parseGender(val);
        if (colGender) {
          parsedGender = colGender;
        }

        // Group (Tổ)
        const grpMatch = val.match(/(?:tổ|nhóm|t|group)?\s*([1-4])/i);
        if (grpMatch && grpMatch[1]) {
          parsedGroup = parseInt(grpMatch[1], 10) as 1 | 2 | 3 | 4;
        }

        // Role
        const matchRole = VALID_ROLES.find((r) => r.toLowerCase() === low);
        if (matchRole) {
          parsedRole = matchRole;
        }

        // Points
        if (/^\d{1,4}$/.test(val)) {
          const pt = parseInt(val, 10);
          if (pt >= 0 && pt <= 1000) parsedPoints = pt;
        }

        // Phone
        if (/(?:0[235789]\d{8,9})/.test(val)) {
          parsedPhone = val.match(/(?:0[235789]\d{8,9})/)?.[0];
        }

        // Birthday
        if (/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}/.test(val)) {
          parsedBirthday = val.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}/)?.[0];
        }
      }

      // If name is still empty, fallback
      if (!parsedName) {
        parsedName = `Học sinh ${parsedStt}`;
      }

      validDrafts.push({
        id: `draft-${Date.now()}-${validDrafts.length}-${Math.random().toString(36).slice(2, 6)}`,
        stt: isNaN(parsedStt) ? validDrafts.length + 1 : parsedStt,
        name: parsedName,
        gender: parsedGender,
        group: parsedGroup,
        role: parsedRole,
        flowerPoints: parsedPoints,
        parentPhone: parsedPhone,
        birthday: parsedBirthday,
        originalRaw: rawLine,
      });
    } else {
      // SINGLE TEXT LINE PARSING (Word / Zalo / Simple list)
      const { cleaned, detectedStt } = stripLeadingNumbering(rawLine);
      if (!cleaned || isHeaderOrIgnoredLine(cleaned)) continue;

      const meta = extractEmbeddedMeta(cleaned);
      const studentName = cleanStudentName(meta.cleanName || cleaned);

      if (!studentName || studentName.length < 2) continue;

      const detectedGender: Gender = meta.gender || inferGenderFromVietnameseName(studentName) || 'nam';

      console.log('[PARSED STUDENT]', studentName, detectedGender === 'nu' ? 'Nữ' : 'Nam');

      validDrafts.push({
        id: `draft-${Date.now()}-${validDrafts.length}-${Math.random().toString(36).slice(2, 6)}`,
        stt: detectedStt !== undefined ? detectedStt : validDrafts.length + 1,
        name: studentName,
        gender: detectedGender,
        group: meta.group || defaultGroup,
        role: meta.role || 'Học sinh',
        flowerPoints: 0,
        parentPhone: meta.phone,
        birthday: meta.birthday,
        originalRaw: rawLine,
      });
    }
  }

  // Renumber STT if they were missing or messy
  const finalDrafts = validDrafts.map((d, idx) => ({
    ...d,
    stt: idx + 1,
  }));

  return enrichDuplicateFlags(finalDrafts, existingStudents);
}

/**
 * Intelligent Excel & CSV importer supporting multiple sheet schemas and column discovery
 */
export async function parseExcelOrCsvFile(
  file: File,
  existingStudents: Student[] = []
): Promise<ParsedStudentDraft[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  if (!rows || rows.length === 0) {
    throw new Error('Tệp Excel/CSV rỗng hoặc không có dữ liệu.');
  }

  // Find header row in first 10 rows
  let headerRowIndex = -1;
  for (let r = 0; r < Math.min(rows.length, 12); r++) {
    const row = rows[r];
    if (!Array.isArray(row)) continue;
    const rowStr = row.map((c) => String(c || '').toLowerCase()).join(' ');

    if (
      (rowStr.includes('tên') || rowStr.includes('name') || rowStr.includes('học sinh')) &&
      (rowStr.includes('họ') || rowStr.includes('stt') || rowStr.includes('giới tính') || rowStr.includes('tổ') || rowStr.includes('nữ') || rowStr.includes('nam'))
    ) {
      headerRowIndex = r;
      break;
    }
  }

  const drafts: ParsedStudentDraft[] = [];

  if (headerRowIndex !== -1) {
    // HEADER-DRIVEN PARSING
    const headers: string[] = (rows[headerRowIndex] || []).map((h: any) =>
      String(h || '').trim().toLowerCase()
    );

    // Column detection with broad synonyms
    const sttIdx = headers.findIndex((h) => h === 'stt' || h.includes('số tt') || h === 'no' || h === '#');
    
    // Check for separate "Họ và đệm" / "Họ lót" AND "Tên" columns
    const hoDemIdx = headers.findIndex((h) => 
      (h.includes('họ') || h.includes('đệm') || h.includes('lót')) && 
      !h.includes('họ và tên') && 
      !h.includes('họ tên') && 
      !h.includes('full name')
    );
    const tenIdx = headers.findIndex((h) => 
      h === 'tên' || h === 'ten' || h === 'first name'
    );

    const fullFullNameIdx = headers.findIndex((h) => 
      h.includes('họ và tên') || 
      h.includes('họ tên') || 
      h.includes('họ & tên') || 
      h.includes('tên học sinh') || 
      h.includes('học sinh') || 
      h.includes('full name') || 
      h.includes('student name') ||
      h === 'tên' ||
      h === 'name'
    );

    const genderIdx = headers.findIndex((h) => 
      h.includes('giới tính') || 
      h.includes('nam/nữ') || 
      h.includes('nam / nữ') || 
      h.includes('nữ') || 
      h.includes('gender') || 
      h.includes('phái')
    );

    const groupIdx = headers.findIndex((h) => 
      h.includes('tổ') || 
      h.includes('nhóm') || 
      h.includes('group') || 
      h.includes('team')
    );

    const roleIdx = headers.findIndex((h) => 
      h.includes('chức vụ') || 
      h.includes('nhiệm vụ') || 
      h.includes('role') || 
      h.includes('chức danh')
    );

    const phoneIdx = headers.findIndex((h) => 
      h.includes('sđt') || 
      h.includes('điện thoại') || 
      h.includes('phone') || 
      h.includes('liên hệ') || 
      h.includes('phụ huynh')
    );

    const pointsIdx = headers.findIndex((h) => 
      h.includes('điểm') || 
      h.includes('hoa') || 
      h.includes('points') || 
      h.includes('tích lũy')
    );

    const birthdayIdx = headers.findIndex((h) => 
      h.includes('sinh') || 
      h.includes('birthday') || 
      h.includes('ngày sinh') || 
      h.includes('dob')
    );

    const targetIdx = headers.findIndex((h) => 
      h.includes('mục tiêu') || 
      h.includes('target') || 
      h.includes('ước mơ')
    );

    const talentsIdx = headers.findIndex((h) => 
      h.includes('năng khiếu') || 
      h.includes('sở trường') || 
      h.includes('talent')
    );

    for (let r = headerRowIndex + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!Array.isArray(row) || row.length === 0) continue;

      let rawName = '';

      // Merge separate Last + First names if both exist
      if (hoDemIdx !== -1 && tenIdx !== -1 && (row[hoDemIdx] || row[tenIdx])) {
        const ho = String(row[hoDemIdx] || '').trim();
        const ten = String(row[tenIdx] || '').trim();
        rawName = cleanStudentName(`${ho} ${ten}`);
      } else if (fullFullNameIdx !== -1 && row[fullFullNameIdx]) {
        rawName = cleanStudentName(String(row[fullFullNameIdx]));
      } else {
        // Fallback: look at first non-empty text column
        for (let c = 0; c < row.length; c++) {
          const val = String(row[c] || '').trim();
          if (val && !/^\d+$/.test(val) && val.length > 2) {
            rawName = cleanStudentName(val);
            break;
          }
        }
      }

      if (!rawName || isHeaderOrIgnoredLine(rawName)) continue;

      // STT
      let stt = drafts.length + 1;
      if (sttIdx !== -1 && row[sttIdx]) {
        const parsed = parseInt(String(row[sttIdx]), 10);
        if (!isNaN(parsed) && parsed > 0) stt = parsed;
      }

      // Gender
      let gender: Gender = 'nam';
      if (genderIdx !== -1 && row[genderIdx] !== undefined) {
        const parsedG = parseGender(String(row[genderIdx]));
        if (parsedG) {
          gender = parsedG;
        } else {
          gender = inferGenderFromVietnameseName(rawName) || 'nam';
        }
      } else {
        gender = inferGenderFromVietnameseName(rawName) || 'nam';
      }

      console.log('[PARSED STUDENT]', rawName, gender === 'nu' ? 'Nữ' : 'Nam');

      // Group (Tổ 1..4)
      let group: 1 | 2 | 3 | 4 = ((drafts.length % 4) + 1) as 1 | 2 | 3 | 4;
      if (groupIdx !== -1 && row[groupIdx] !== undefined) {
        const grpVal = parseInt(String(row[groupIdx]).replace(/\D/g, ''), 10);
        if (grpVal >= 1 && grpVal <= 4) group = grpVal as 1 | 2 | 3 | 4;
      }

      // Role
      let role: StudentRole = 'Học sinh';
      if (roleIdx !== -1 && row[roleIdx]) {
        const rVal = String(row[roleIdx]).trim();
        const matched = VALID_ROLES.find((vr) => vr.toLowerCase() === rVal.toLowerCase());
        if (matched) role = matched;
      }

      // Phone
      const parentPhone = phoneIdx !== -1 && row[phoneIdx] ? String(row[phoneIdx]).trim() : undefined;

      // Birthday
      let birthday = birthdayIdx !== -1 && row[birthdayIdx] ? String(row[birthdayIdx]).trim() : undefined;
      // Handle Excel numeric date serialization if needed
      if (birthday && !isNaN(Number(birthday)) && Number(birthday) > 20000) {
        try {
          const dateObj = new Date((Number(birthday) - 25569) * 86400 * 1000);
          birthday = dateObj.toLocaleDateString('vi-VN');
        } catch (e) {
          // ignore
        }
      }

      // Points
      let flowerPoints = 0;
      if (pointsIdx !== -1 && row[pointsIdx]) {
        const pt = parseInt(String(row[pointsIdx]).replace(/\D/g, ''), 10);
        if (!isNaN(pt) && pt >= 0) flowerPoints = pt;
      }

      const personalTarget = targetIdx !== -1 && row[targetIdx] ? String(row[targetIdx]).trim() : undefined;
      const talents = talentsIdx !== -1 && row[talentsIdx] ? String(row[talentsIdx]).trim() : undefined;

      drafts.push({
        id: `draft-excel-${Date.now()}-${r}-${Math.random().toString(36).slice(2, 6)}`,
        stt: drafts.length + 1,
        name: rawName,
        gender,
        group,
        role,
        flowerPoints,
        parentPhone,
        birthday,
        personalTarget,
        talents,
      });
    }
  } else {
    // NO HEADER DETECTED -> Fallback line-by-line raw extraction
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      if (!Array.isArray(row) || row.length === 0) continue;
      const rowText = row.map((c) => String(c || '').trim()).filter(Boolean).join('\t');
      if (!rowText || isHeaderOrIgnoredLine(rowText)) continue;

      const subDrafts = parseFlexibleStudentText(rowText, existingStudents);
      if (subDrafts.length > 0) {
        drafts.push(...subDrafts);
      }
    }
  }

  if (drafts.length === 0) {
    throw new Error('Không thể nhận diện được danh sách học sinh từ tệp. Vui lòng kiểm tra lại cấu trúc tệp hoặc dán trực tiếp.');
  }

  // Renumber STT sequentially
  const finalDrafts = drafts.map((d, idx) => ({
    ...d,
    stt: idx + 1,
  }));

  return enrichDuplicateFlags(finalDrafts, existingStudents);
}

/**
 * Converts approved ParsedStudentDraft list into production-ready Student array
 */
export function convertDraftsToStudents(
  drafts: ParsedStudentDraft[],
  existingStudents: Student[] = []
): Student[] {
  const existingCodes = new Set(existingStudents.map((s) => s.securityCode || ''));

  return drafts.map((d, idx) => {
    const secCode = generateUnique5DigitCode(existingCodes);
    existingCodes.add(secCode);

    return {
      id: `hs-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      stt: d.stt || idx + 1,
      name: cleanStudentName(d.name),
      gender: d.gender || 'nam',
      group: d.group || 1,
      role: d.role || 'Học sinh',
      flowerPoints: d.flowerPoints || 0,
      lifetimePoints: d.flowerPoints || 0,
      avatarSeed: cleanStudentName(d.name),
      securityCode: secCode,
      birthday: d.birthday ? String(d.birthday).trim() : '',
      parentPhone: d.parentPhone ? String(d.parentPhone).trim() : '',
      personalTarget: d.personalTarget ? String(d.personalTarget).trim() : '',
      talents: d.talents ? String(d.talents).trim() : '',
      notes: d.notes ? String(d.notes).trim() : '',
      shields: 0,
      consecutiveOnTimeDays: 0,
      bloomedGardens: [],
      badges: ['🌱 Thành viên mới'],
    };
  });
}
