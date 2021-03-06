/*
Copyright 2020 The Chromium Authors. All rights reserved.
Use of this source code is governed by a BSD-style license that can be
found in the LICENSE file.
*/

import './coverage-percentage-views.js';
import {CoverageClient} from './coverage.js';

Gerrit.install(function(plugin) {
  const coverageClient = new CoverageClient(plugin);
  const annotationApi = plugin.annotationApi();
  annotationApi.setCoverageProvider(coverageClient.provideCoverageRanges);

  // provideCoverageRanges is only called when user expands diff view, and
  // to make sure coverage data can be fetched in time and show up
  // reliably, prefetch the coverage data in advance.
  plugin.on('showchange', coverageClient.prefetchCoverageRanges);

  // Following components are regiested to display coverage percentages.
  function onAttached(needsProvider=false) {
    return async function(view) {
      view.shown = await coverageClient.showPercentageColumns();

      if (needsProvider) {
        view.provider = coverageClient.provideCoveragePercentages;
      }
    };
  }

  plugin.registerDynamicCustomComponent(
      'change-view-file-list-header',
      'absolute-header-view').onAttached(onAttached());
  plugin.registerDynamicCustomComponent(
      'change-view-file-list-header',
      'incremental-header-view').onAttached(onAttached());

  plugin.registerDynamicCustomComponent(
      'change-view-file-list-content',
      'absolute-content-view').onAttached(onAttached(true));
  plugin.registerDynamicCustomComponent(
      'change-view-file-list-content',
      'incremental-content-view').onAttached(onAttached(true));

  plugin.registerDynamicCustomComponent(
      'change-view-file-list-summary',
      'absolute-summary-view').onAttached(onAttached());
  plugin.registerDynamicCustomComponent(
      'change-view-file-list-summary',
      'incremental-summary-view').onAttached(onAttached());
});
