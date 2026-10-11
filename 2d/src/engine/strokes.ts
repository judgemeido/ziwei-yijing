// 姓名笔画(康熙/繁体近似):用 cnchar + cnchar-trad,先简转繁再数笔画,贴近姓名学典籍用法。
// cnchar 体积较大,动态加载。仅供文化娱乐。

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
        return { input: name, tradName: perChar.map((p) => p.trad).join(""), perChar, total };
      };
    })();
  }
  return loader;
}

/** 计算中文姓名的康熙(繁体近似)笔画。 */
export async function nameStrokes(name: string): Promise<NameStrokeResult> {
  const engine = await getEngine();
  return engine(name.trim());
}
