import {makeAutoObservable} from 'mobx'

class Config {
  public path = '';

  constructor() {
    makeAutoObservable(this);
  }
}

export default new Config();