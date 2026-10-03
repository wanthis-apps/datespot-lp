const DEFAULT_MAX_LENGTH = 40;
const MIN_SEGMENT_LENGTH = 6;

type FormatJapaneseTextOptions = {
  /** この文字数以上では改行を足さない。 */
  maxLength?: number;
  /** 挿入する改行の上限。2行カードでは 1。 */
  maxBreaks?: number;
};

/**
 * 短い日本語文の読点の直後に改行を入れる。
 * 前後が短すぎる読点や、長い説明文はそのまま返す。
 */
export function formatJapaneseText(
  text: string,
  options?: FormatJapaneseTextOptions,
): string {
  const maxLength = options?.maxLength ?? DEFAULT_MAX_LENGTH;
  const maxBreaks = options?.maxBreaks ?? Number.POSITIVE_INFINITY;
  const source = text.replace(/\r\n/g, '\n');
  const compactLength = [...source.replace(/\s/g, '')].length;

  if (compactLength === 0 || compactLength >= maxLength || source.includes('\n')) {
    return source;
  }

  let breaks = 0;
  let index = 0;
  let result = '';

  for (const char of source) {
    result += char;
    index += 1;
    if (char !== '、' || breaks >= maxBreaks) {
      continue;
    }

    const after = [...source.slice(index)].length;
    if (index < MIN_SEGMENT_LENGTH || after < MIN_SEGMENT_LENGTH) {
      continue;
    }

    result += '\n';
    breaks += 1;
  }

  return result;
}
