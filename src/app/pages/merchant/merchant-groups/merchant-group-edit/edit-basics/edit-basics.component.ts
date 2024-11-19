import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { RadioChange } from '@visa/vds-angular';
import { EMPTY } from 'src/app/core/constants';
import { CreateDataService } from 'src/app/services/private/create-data.service';

@Component({
  selector: 'app-edit-basics',
  templateUrl: './edit-basics.component.html',
  styleUrls: ['./edit-basics.component.scss']
})
export class EditBasicsComponent implements OnInit {
  data: any = null;

  merchantGroup = this.fb.group({
    name: [EMPTY, Validators.required],
    type: ['MerchantInfo', Validators.required],
    description: [
      'Vitae ac risus, purus posuere sed ornare dui malesuada. Malesuada habitant aliquet sem fringilla eu duis mauris vestibulum aliquam. Diam pellentesque sed ipsum vitae nunc urna. Venenatis est justo, quisque praesent lacus, nibh. At neque viverra facilisi cras dictumst facilisi condimentum. ',
      Validators.required
    ],
    optionalComment: [
      'Diam pellentesque sed ipsum vitae nunc urna. Venenatis est justo, quisque praesent lacus, nibh. At neque viverra facilisi cras dictumst facilisi condimentum. '
    ]
  });

  constructor(
    private fb: UntypedFormBuilder,
    private dataService: CreateDataService
  ) {
    this.data = this.dataService.createMerchantData.getValue();

    if (this.data) {
      this.merchantGroup.controls['name'].setValue(
        this.data.name || this.data.merchantGroupName || ''
      );
      this.merchantGroup.controls['type'].setValue(
        this.data.type || this.data.merchantGroupType || 'MerchantInfo'
      );
      this.merchantGroup.controls['description'].setValue(
        this.data.description ||
        'Vitae ac risus, purus posuere sed ornare dui malesuada. Malesuada habitant aliquet sem fringilla eu duis mauris vestibulum aliquam. Diam pellentesque sed ipsum vitae nunc urna. Venenatis est justo, quisque praesent lacus, nibh. At neque viverra facilisi cras dictumst facilisi condimentum. '
      );
      this.merchantGroup.controls['optionalComment'].setValue(
        this.data.optionalComment ||
        'Diam pellentesque sed ipsum vitae nunc urna. Venenatis est justo, quisque praesent lacus, nibh. At neque viverra facilisi cras dictumst facilisi condimentum. '
      );
    }
  }

  ngOnInit(): void { }

  selectMerchantGroupType(valueObj: RadioChange) {
    this.merchantGroup.controls['type'].setValue(valueObj.value);
  }
}
