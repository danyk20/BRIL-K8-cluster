import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { VDMBXComponent } from './vdm-bx.component';
import { DataService } from 'app/widgets/array-snapshot/data.service';

@NgModule({
    imports: [
        CommonModule,
        SharedModule
    ],
    providers: [DataService],
    declarations: [VDMBXComponent]
})
export class VDMBXModule {
    static entry = VDMBXComponent;
}
