export enum CGType {
  Graphic,
  Anime
}

export interface CGGraphicInfo {
  /*LONG	序號;	圖片的編號
DWORD	地址;	指明圖片在數據文件中的起始位置
DWORD	塊長度;	圖片數據塊的大小
LONG	偏移量X;	顯示圖片時，橫坐標偏移X
LONG	偏移量Y;	顯示圖片時，縱坐標偏移Y
LONG	圖片寬度;	...
LONG	圖片高度;	...
BYTE	佔地面積-東;	佔地面積是物件所佔的大小，1就表示占1格
BYTE	佔地面積-南;	同上
BYTE	標誌;	用於地圖，0表示障礙物，1表示可以走上去
BYTE[5]	未知;	在StoneAge中本字段長度為45字節
LONG	地圖編號;	低16位表示在地圖文件裡的編號，高16位可能表示版本，非地圖單位的此項均為0*/
  SeqNo: number;
  Offset: number;
  Length: number;
  OffsetX: number;
  OffsetY: number;
  Width: number;
  Height: number;
  SizeX: number;
  SizeY: number;
  Flag: number;

// [field: MarshalAs(UnmanagedType.ByValArray, SizeConst = 5)]
  Padding: number;
  Padding2: number;
  MapNo: number;
  Type: CGType;
}

export interface CGAnimeInfo {
  AnimateNo: number;
  Offset: number;
  Count: number;
  Padding: number;
  Type: CGType;
}
