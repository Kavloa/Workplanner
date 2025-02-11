<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.jsdelivr.net/gh/alpinejs/alpine@v2.x.x/dist/alpine.min.js" defer></script>
  @vite('resources/css/app.css')
</head>
<body>
<div class="min-h-screen">
  <div class="antialiased bg-black dark-mode:bg-gray-900">
  <div class="w-full text-gray-700 bg-black dark-mode:text-gray-200 dark-mode:bg-gray-800">
    <div x-data="{ open: true }" class="flex flex-col max-w-screen-xl px-4 mx-auto md:items-center md:justify-between md:flex-row md:px-6 lg:px-8">
          <button class="rounded-lg mt-6 md:hidden focus:outline-none focus:shadow-outline" @click="open = !open">
          <svg fill="currentColor" viewBox="0 0 20 20" class="w-6 h-6">
            <path x-show="!open" fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM9 15a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1z" clip-rule="evenodd"></path>
            <path x-show="open" fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button> 
    <div class="flex flex-row items-center justify-between p-4">
      <nav :class="{'flex': open, 'hidden': !open}" class="flex-col flex-grow hidden pb-4 md:pb-0 md:flex md:justify-end md:flex-row">
        <a class="px-4 py-2 mt-2 text-sm text-white font-semibold bg-transparent rounded-lg dark-mode:bg-transparent dark-mode:hover:bg-gray-600 dark-mode:focus:bg-gray-600 dark-mode:focus:text-white dark-mode:hover:text-white dark-mode:text-gray-200 md:mt-0 md:ml-4 hover:text-gray-900 focus:text-gray-900 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline" href="/">Employee</a>
        <a class="px-4 py-2 mt-2 text-sm text-white font-semibold bg-transparent rounded-lg dark-mode:bg-transparent dark-mode:hover:bg-gray-600 dark-mode:focus:bg-gray-600 dark-mode:focus:text-white dark-mode:hover:text-white dark-mode:text-gray-200 md:mt-0 md:ml-4 hover:text-gray-900 focus:text-gray-900 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline" href="/subs">Subs</a>
        <a class="px-4 py-2 mt-2 text-sm text-white font-semibold bg-transparent rounded-lg dark-mode:bg-transparent dark-mode:hover:bg-gray-600 dark-mode:focus:bg-gray-600 dark-mode:focus:text-white dark-mode:hover:text-white dark-mode:text-gray-200 md:mt-0 md:ml-4 hover:text-gray-900 focus:text-gray-900 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline" href="/gantt">histogram</a>
        </div>    
      </nav>  
      </div>
    </div>
  </div>
  <div class='mt-10'>
  <div class='flex flex-col gap-2 mt-10'>
        <div class='justify-around max-w-[900px]   items-center flex-row flex'>
            <h1 class='flex font-bold text-2xl'>User Availability</h1>
            <div class='flex flex-row gap-1 '>
            <button class='bg-white text-blue-300 border-blue-300 border-[1px] p-2 rounded-lg'>Duplicate Month</button>
            <button class='bg-white text-green-300 border-green-300 border-[1px] p-2 px-6 rounded-lg'>Save</button>
            </div>
        </div>
        <div class='flex flex-col mx-3 lg:flex-row md:mt-10 md:mb-10 md:gap-16 items-center lg:mx-12 '>
        <select x-model="selectedEmployee" x-on:change="updateTable()" class='rounded-xl p-3 px-5' label="Employee">
        @foreach($employees as $employee)
            <option class='rounded-xl p-2 px-5' value='{{ $employee->id }}'>{{ $employee->first_name }}</option>
        @endforeach
    </select>
            <input class='rounded-md border-[2px] p-2' type="date" placeholder='Start Date' />
            <input type="date" class='rounded-md border-[2px] p-2' placeholder='End Date' />
        </div>
        <div class='ml-8  gap-3  lg:mrx-12 overflow-auto'>
        <table class=" border-collapse border border-gray-300">
            <thead>
                <tr class="bg-gray-200">
                    <th class="border-y border-gray-100 bg-gray-50/50 p-1">Date</th>
                    <th class="border-y border-gray-100 bg-gray-50/50 p-1">From</th>
                    <th class="border-y border-gray-100 bg-gray-50/50 p-1">To</th>
                    <th class="border-y border-gray-100 bg-gray-50/50 p-1">From</th>
                    <th class="border-y border-gray-100 bg-gray-50/50 p-1">To</th>
                    <th class="border-y border-gray-100 bg-gray-50/50 p-1">From</th>
                    <th class="border-y border-gray-100 bg-gray-50/50 p-1">To</th>
                    <th class="border-y border-gray-100 bg-gray-50/50 p-1">From</th>
                    <th class="border-y border-gray-100 bg-gray-50/50 p-1">To</th>
                    <th class="border-y border-gray-100 bg-gray-50/50 p-1">Total</th>

                    <th class="border-y border-gray-100 bg-gray-50/50 p-1">Actions</th>
                </tr>
            </thead>
        <tbody id="attendees-list">
            @foreach($selectedemployee->availabilities as $availability)
            <tr>
                <td class="border border-gray-300 px-2 py-2">
                    <input type="date" class="rounded border hourly-rate w-22 py-2" value="{{ $availability->date }}" />
                </td>
                <td class="border border-gray-300 py-2 text-center">
                    <input type="time" class="p-2 w-full rounded border hourly-rate" value="{{ $availability->strt1 }}" disabled />
                </td>
                <td class="border border-gray-300 py-2 text-center">
                    <input type="time" value="{{ $availability->end1 }}" class="p-2 w-full rounded border attendees-count" disabled />
                </td>
                <td class="border border-gray-300 py-2 text-center">
                    <input type="time" class="p-2 w-full rounded border total-cost" value="{{ $availability->strt2 }}" disabled />
                </td>
                <td class="border border-gray-300 py-2 text-center">
                    <input type="time" class="p-2 w-full rounded border total-cost" value="{{ $availability->end2 }}" disabled />
                </td>
                <td class="border border-gray-300 py-2 text-center">
                    <input type="time" class="p-2 w-full rounded border total-cost" value="{{ $availability->strt3 }}" disabled />
                </td>
                <td class="border border-gray-300 py-2 text-center">
                    <input type="time" class="p-2 w-full rounded border total-cost" value="{{ $availability->end3 }}" disabled />
                </td>
                <td class="border border-gray-300 py-2 text-center">
                    <input type="time" class="p-2 w-full rounded border total-cost" value="{{ $availability->strt4 }}" disabled />
                </td>
                <td class="border border-gray-300 py-2 text-center">
                    <input type="time" class="p-2 w-full rounded border total-cost" value="{{ $availability->end4 }}" disabled />
                </td>
                <td class="border border-gray-300 py-2 text-center">
                {{ $availability->Total }}
                </td>
                <td class="border border-gray-300 py-4 flex flex-row items-center justify-center text-center">
                    <button onclick="removeRow(this)" class="p-2 w-full text-black-600" disabled>
                        <svg class="w-6 h-6" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 24 24">
                            <path d="M 10 2 L 9 3 L 4 3 L 4 5 L 5 5 L 5 20 C 5 20.522222 5.1913289 21.05461 5.5683594 21.431641 C 5.9453899 21.808671 6.4777778 22 7 22 L 17 22 C 17.522222 22 18.05461 21.808671 18.431641 21.431641 C 18.808671 21.05461 19 20.522222 19 20 L 19 5 L 20 5 L 20 3 L 15 3 L 14 2 L 10 2 z M 7 5 L 17 5 L 17 20 L 7 20 L 7 5 z M 9 7 L 9 18 L 11 18 L 11 7 L 9 7 z M 13 7 L 13 18 L 15 18 L 15 7 L 13 7 z"></path>
                        </svg>
                    </button>
                    <button onclick="removeRow(this)" class="p-2 w-full text-green-600" disabled>
                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" class='w-6 h-6' viewBox="0 0 50 50">
                            <path d="M 43.125 2 C 41.878906 2 40.636719 2.488281 39.6875 3.4375 L 38.875 4.25 L 45.75 11.125 C 45.746094 11.128906 46.5625 10.3125 46.5625 10.3125 C 48.464844 8.410156 48.460938 5.335938 46.5625 3.4375 C 45.609375 2.488281 44.371094 2 43.125 2 Z M 37.34375 6.03125 C 37.117188 6.0625 36.90625 6.175781 36.75 6.34375 L 4.3125 38.8125 C 4.183594 38.929688 4.085938 39.082031 4.03125 39.25 L 2.03125 46.75 C 1.941406 47.09375 2.042969 47.457031 2.292969 47.707031 C 2.542969 47.957031 2.90625 48.058594 3.25 47.96875 L 10.75 45.96875 C 10.917969 45.914063 11.070313 45.816406 11.1875 45.6875 L 43.65625 13.25 C 44.054688 12.863281 44.058594 12.226563 43.671875 11.828125 C 43.285156 11.429688 42.648438 11.425781 42.25 11.8125 L 9.96875 44.09375 L 5.90625 40.03125 L 38.1875 7.75 C 38.488281 7.460938 38.578125 7.011719 38.410156 6.628906 C 38.242188 6.246094 37.855469 6.007813 37.4375 6.03125 C 37.40625 6.03125 37.375 6.03125 37.34375 6.03125 Z"></path>
                        </svg>
                    </button>
                    <button onclick="removeRow(this)" class="p-2 w-full text-red-600 " disabled>
                        <svg fill="#000000" class='w-6 h-6 text-green-600' version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 330 330" xml:space="preserve">
                            <g>
                                <path d="M35,270h45v45c0,8.284,6.716,15,15,15h200c8.284,0,15-6.716,15-15V75c0-8.284-6.716-15-15-15h-45V15
                                    c0-8.284-6.716-15-15-15H35c-8.284,0-15,6.716-15,15v240C20,263.284,26.716,270,35,270z M280,300H110V90h170V300z M50,30h170v30H95
                                    c-8.284,0-15,6.716-15,15v165H50V30z" />
                                <path d="M155,120c-8.284,0-15,6.716-15,15s6.716,15,15,15h80c8.284,0,15-6.716,15-15s-6.716-15-15-15H155z" />
                                <path d="M235,180h-80c-8.284,0-15,6.716-15,15s6.716,15,15,15h80c8.284,0,15-6.716,15-15S243.284,180,235,180z" />
                                <path d="M235,240h-80c-8.284,0-15,6.716-15,15c0,8.284,6.716,15,15,15h80c8.284,0,15-6.716,15-15C250,246.716,243.284,240,235,240z
                                    " />
                            </g>
                        </svg>
                    </button>
                </td>
            </tr>
        @endforeach
    </tbody>

        </table>
        </div>
    </div>
  </div>
</div>
</body>
</html>