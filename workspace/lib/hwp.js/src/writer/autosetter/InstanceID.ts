export default class InstanceID {
  private static START_OBJECT_ID: number = 0x5bb840e1
  private id: number

  constructor() {
    this.id = InstanceID.START_OBJECT_ID
  }

  public get(): number {
    return this.id++
  }
}
