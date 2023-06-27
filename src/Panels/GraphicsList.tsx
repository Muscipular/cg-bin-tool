import {useVirtual} from 'react-virtual';
import binService from "../Service/BinService.ts";
import {useCallback, useMemo, useRef, useState} from "react";
import {CGAnimeInfo, CGGraphicInfo, CGType} from "../Service/CGGraphicInfo.ts";
import {InputGroup} from "@blueprintjs/core";

let cacheReg: RegExp | null = null;
let cacheRegStr: string = '';

function match(s: string, p: string) {
  let exp: RegExp | null = null;
  try {
    if (cacheRegStr == p) {
      exp = cacheReg;
    } else {
      exp = new RegExp(p);
      cacheRegStr = p;
      cacheReg = exp
    }
  } catch (e) {
    cacheRegStr = p;
    cacheReg = null;
  }
  if (exp) {
    return exp.test(s);
  } else {
    return s.indexOf(p);
  }
}

function renderItem(o: CGAnimeInfo | CGGraphicInfo) {
  if (o.Type == CGType.Graphic) {
    let e = o as CGGraphicInfo;
    return `#${e.SeqNo}/${e.MapNo}`
  }
  if (o.Type == CGType.Anime) {
    let e = o as CGAnimeInfo;
    return `#${e.AnimateNo}`
  }
  return ''
}

export default function GraphicsList(props: { bin: string, onSelect?: (s: CGGraphicInfo | CGAnimeInfo) => void }) {
  const { bin } = props;
  // console.log(bin);
  let binList: (CGGraphicInfo | CGAnimeInfo)[] = useMemo(() => binService.getGraphicList(bin) || binService.getAnimeList(bin) || [], [bin]);
  let [filter, setFilter] = useState('');
  let infos = useMemo(() => filter ? binList.filter((e: CGGraphicInfo | CGAnimeInfo) => match(renderItem(e), filter)) : binList, [filter, binList]);
  const scrollElRef = useRef<HTMLDivElement>(null);
  let virtualList = useVirtual({
    estimateSize: useCallback(() => 26, []),
    overscan: 10,
    size: infos.length,
    keyExtractor: useCallback((index: number) => index + infos[index].Offset, [infos]),
    parentRef: scrollElRef,
    // paddingStart: 1,
    // scrollToFn: scrollToFn,
  });
  let [selected, setSelected] = useState(-1);

  return <>
    <InputGroup value={filter} onChange={e => setFilter(e.currentTarget.value)}/>
    <div ref={scrollElRef} style={{ overflow: 'auto', height: '100%' }} className={'list-scroller'}>
      <div style={{
        width: "100%",
        height: `${virtualList.totalSize}px`,
        position: "relative",
        // minHeight: 'calc(100% + 1px)',
      }}>
        {virtualList.virtualItems.map(e => <div key={e.key} className={(selected === e.index ? 'selected' : '') + ' g-item'} style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${e.size}px`,
          transform: `translateY(${e.start}px)`,
        }} onClick={_ => {
          setSelected(e.index);
          props.onSelect?.(infos[e.index])
        }}>
          {renderItem(infos[e.index])}
        </div>)}
      </div>
    </div>
  </>
}
