import { Subject } from 'rxjs';

export class AddMerchantService {
  private MerchantData = new Subject<object[]>();
  constructor() { }

  getMerchantData() {
    return this.MerchantData.asObservable();
  }

  setMerchantData(value: object[]) {
    this.MerchantData.next(value);
  }

  addBinCaidTableDataColumns(tableData: any) {
    let newTableData: any[] = [];
    if (tableData && Array.isArray(tableData) && tableData.length > 0) {
      tableData.forEach((row: any) => {
        if (row && row.AuRawBinCaid) {
          const pairs = row.AuRawBinCaid.split(';');
          pairs.forEach((pair: any) => {
            let [bin, caid] = pair.split(':');
            caid = caid.split('#')[0];
            newTableData.push({ ...row, bin: bin || '-', caid: caid || '-' });
          });
        } else {
          newTableData.push({ ...row, bin: '-', caid: '-' });
        }
      });
    }
    return newTableData;
  }
}
