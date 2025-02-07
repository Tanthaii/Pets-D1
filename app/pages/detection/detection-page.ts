import { NavigatedData, Page } from '@nativescript/core';
import { DetectionViewModel } from './detection-view-model';

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    page.bindingContext = new DetectionViewModel();
}