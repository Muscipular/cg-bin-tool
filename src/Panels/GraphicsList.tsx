import {useVirtual, VirtualItem} from 'react-virtual';
import binService from "../Service/BinService.ts";
import {useCallback, useMemo, useRef} from "react";
import {CGGraphicInfo} from "../Service/CGGraphicInfo.ts";

export default function GraphicsList(props: { bin: string, onSelect?: (s: CGGraphicInfo) => void }) {
  const { bin } = props;
  // console.log(bin);
  let binList = useMemo(() => binService.getBinList(bin) || [], [bin]);

  const scrollElRef = useRef<HTMLDivElement>(null);
  let virtualList = useVirtual({
    estimateSize: useCallback(() => 26, []),
    overscan: 10,
    size: binList.length,
    keyExtractor: useCallback((index: number) => index + binList[index].Offset, [binList]),
    parentRef: scrollElRef,
    // paddingStart: 1,
    // scrollToFn: scrollToFn,
  });

  return <div ref={scrollElRef} style={{ overflow: 'auto', height: '100%' }}>
    <div style={{
      width: "100%",
      height: `${virtualList.totalSize}px`,
      position: "relative",
      // minHeight: 'calc(100% + 1px)',
    }}>
      {virtualList.virtualItems.map(e => <div key={e.key} style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: `${e.size}px`,
        transform: `translateY(${e.start}px)`,
      }} onClick={_ => props.onSelect?.(binList[e.index])}>
        #{binList[e.index].SeqNo}/{binList[e.index].MapNo}
      </div>)}
    </div>
  </div>
}
