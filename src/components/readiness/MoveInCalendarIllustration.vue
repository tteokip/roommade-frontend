<template>
  <svg viewBox="0 0 180 160" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="calendar-header" x1="41" y1="36" x2="145" y2="67">
        <stop stop-color="#8b5cf6" />
        <stop offset="1" stop-color="#6d28d9" />
      </linearGradient>
      <linearGradient id="calendar-body" x1="51" y1="65" x2="139" y2="139">
        <stop stop-color="#ffffff" />
        <stop offset="1" stop-color="#eee9fb" />
      </linearGradient>
      <filter
        id="calendar-shadow"
        x="25"
        y="20"
        width="135"
        height="135"
        filterUnits="userSpaceOnUse"
      >
        <feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#6d28d9" flood-opacity="0.2" />
      </filter>
    </defs>

    <g filter="url(#calendar-shadow)">
      <path
        d="M42 61c0-10 8-18 18-18h68c10 0 18 8 18 18v65c0 10-8 18-18 18H60c-10 0-18-8-18-18V61Z"
        fill="url(#calendar-body)"
      />
      <path d="M42 61c0-10 8-18 18-18h68c10 0 18 8 18 18v18H42V61Z" fill="url(#calendar-header)" />
      <path
        d="m74 108 13 13 27-29"
        stroke="#7c3aed"
        stroke-width="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>

    <g stroke="#9ca3af" stroke-width="8" stroke-linecap="round">
      <path d="M68 29v28" />
      <path d="M120 29v28" />
    </g>
    <g fill="#e9d5ff">
      <path d="m22 46 6-6 6 6-6 6-6-6Z" />
      <path d="m153 87 5-5 5 5-5 5-5-5Z" />
      <circle cx="31" cy="116" r="5" />
    </g>
    <g fill="#f59eaa">
      <path d="m149 31 4-2 4 10-4 2-4-10Z" />
      <path d="m19 82 4-3 6 8-4 3-6-8Z" />
    </g>
    <path d="m151 125 5-4 5 7-5 4-5-7Z" fill="#7dd3fc" />
    <path d="m35 24 5-4 5 7-5 4-5-7Z" fill="#fbbf24" />
  </svg>
</template>
