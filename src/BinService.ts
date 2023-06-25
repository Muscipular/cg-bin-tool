import {makeAutoObservable} from "mobx";

class BinService {
  binList: string[] = ['v2', 'ex', ...(Array.from({length: 20})).map((e, i) => `bin${i}`)];
  animeList: string[] = ['v2', 'ex'];


  constructor() {
    makeAutoObservable(this)
  }
}

export default new BinService();