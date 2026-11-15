// @ts-nocheck
'use strict';

function createSharedState(initial = {}) {
  const S = {
    mainWindow: null,
    chatWindow: null,
    tray: null,
    isClickThrough: true,
    currentView: 'full',
    userHasMoved: false,
    chatTheme: 'dark',
    activeModelId: initial.activeModelId || null,
    ...initial,
  };
  return S;
}

module.exports = { createSharedState };
