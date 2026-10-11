// 姓名笔画(康熙/繁体近似):用 cnchar + cnchar-trad,先简转繁再数笔画,贴近姓名学典籍用法。
// 并区分「姓」与「名」(支持常见复姓),分别计数,供梅花易数姓名起卦。仅供文化娱乐。

export interface NameStroke {
  char: string;
  trad: string;
  strokes: number;
}
export interface NameStrokeResult {
  input: string;
  tradName: string;
  perChar: NameStroke[];
  total: number;
  surnameCount: number;    // 姓字数(1 或 2,复姓为 2)
  surname: string;         // 姓(原字)
  given: string;           // 名(原字)
  surnameStrokes: number;  // 姓笔画
  givenStrokes: number;    // 名笔画
}

// 常见复姓(两字),用于拆分姓名时识别「姓」的长度。
const COMPOUND_SURNAMES = new Set([
  "欧阳", "太史", "端木", "上官", "司马", "东方", "独孤", "南宫", "万俟", "闻人",
  "夏侯", "诸葛", "尉迟", "公羊", "赫连", "澹台", "皇甫", "宗政", "濮阳", "公冶",
  "太叔", "申屠", "公孙", "慕容", "仲孙", "钟离", "长孙", "宇文", "司徒", "鲜于",
  "司空", "闾丘", "子车", "亓官", "司寇", "巫马", "公西", "颛孙", "壤驷", "公良",
  "漆雕", "乐正", "宰父", "谷梁", "拓跋", "夹谷", "轩辕", "令狐", "段干", "百里",
  "呼延", "东郭", "南门", "羊舌", "微生", "梁丘", "左丘", "东门", "西门", "南荣",
]);

function surnameLen(chars: string[]): number {
  if (chars.length >= 3 && COMPOUND_SURNAMES.has(chars[0] + chars[1])) return 2;
  return 1;
}

let loader: Promise<(name: string) => NameStrokeResult> | null = null;

async function getEngine(): Promise<(name: string) => NameStrokeResult> {
  if (!loader) {
    loader = (async () => {
      const cnMod = await import("cnchar");
      const cn = (cnMod as unknown as { default: any }).default ?? (cnMod as any);
      const tradMod = await import("cnchar-trad");
      try { cn.use((tradMod as unknown as { default: any }).default ?? tradMod); } catch { /* 已注册则忽略 */ }

      return (name: string): NameStrokeResult => {
        const chars = Array.from(name).filter((c) => /[\u4e00-\u9fff]/.test(c));
        const perChar: NameStroke[] = chars.map((c) => {
          let trad = c;
          try { trad = cn.convert.simpleToTrad(c) || c; } catch { trad = c; }
          let n = 0;
          try { n = cn.stroke(trad); } catch { n = 0; }
          if (!n || n < 0) {
            try { n = cn.stroke(c); } catch { n = 0; }
          }
          return { char: c, trad, strokes: n > 0 ? n : 0 };
        });
        const total = perChar.reduce((s, p) => s + p.strokes, 0);
        const sc = perChar.length ? surnameLen(chars) : 0;
        const surnameChars = perChar.slice(0, sc);
        const givenChars = perChar.slice(sc);
        const surnameStrokes = surnameChars.reduce((s, p) => s + p.strokes, 0);
        const givenStrokes = givenChars.reduce((s, p) => s + p.strokes, 0);
        return {
          input: name,
          tradName: perChar.map((p) => p.trad).join(""),
          perChar,
          total,
          surnameCount: sc,
          surname: surnameChars.map((p) => p.char).join(""),
          given: givenChars.map((p) => p.char).join(""),
          surnameStrokes,
          givenStrokes,
        };
      };
    })();
  }
  return loader;
}

/** 计算中文姓名的康熙(繁体近似)笔画,并拆分姓 / 名。 */
export async function nameStrokes(name: string): Promise<NameStrokeResult> {
  const engine = await getEngine();
  return engine(name.trim());
}
