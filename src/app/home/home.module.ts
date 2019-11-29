import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CoreModule } from '@app/core';
import { SharedModule } from '@app/shared';
import { MaterialModule } from '@app/material.module';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { EngineComponent } from '@app/engine/engine.component';
import { UiComponent } from '@app/ui/ui.component';
import { UiInfobarBottomComponent } from '@app/ui/ui-infobar-bottom/ui-infobar-bottom.component';
import { UiInfobarTopComponent } from '@app/ui/ui-infobar-top/ui-infobar-top.component';
import { UiSidebarLeftComponent } from '@app/ui/ui-sidebar-left/ui-sidebar-left.component';
import { UiSidebarRightComponent } from '@app/ui/ui-sidebar-right/ui-sidebar-right.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    CoreModule,
    SharedModule,
    FlexLayoutModule,
    MaterialModule,
    HomeRoutingModule
  ],
  declarations: [
    HomeComponent,
    EngineComponent,
    UiComponent,
    UiInfobarBottomComponent,
    UiInfobarTopComponent,
    UiSidebarLeftComponent,
    UiSidebarRightComponent
  ]
})
export class HomeModule {}
