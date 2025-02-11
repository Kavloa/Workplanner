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
        <a class="px-4 py-2 mt-2 text-sm text-white font-semibold bg-transparent rounded-lg dark-mode:bg-transparent dark-mode:hover:bg-gray-600 dark-mode:focus:bg-gray-600 dark-mode:focus:text-white dark-mode:hover:text-white dark-mode:text-gray-200 md:mt-0 md:ml-4 hover:text-gray-900 focus:text-gray-900 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline" href="/sub">Subs</a>
        <a class="px-4 py-2 mt-2 text-sm text-white font-semibold bg-transparent rounded-lg dark-mode:bg-transparent dark-mode:hover:bg-gray-600 dark-mode:focus:bg-gray-600 dark-mode:focus:text-white dark-mode:hover:text-white dark-mode:text-gray-200 md:mt-0 md:ml-4 hover:text-gray-900 focus:text-gray-900 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline" href="/gantt">histogram</a>
        </div>    
      </nav>  
      </div>
    </div>
  </div>
  <div class='mt-10'>
  <div class='flex flex-col gap-2 mt-10'>
  <div>

  <div class='justify-around    items-center flex-row flex'>        
        </div>
       <div class='flex flex-col gap-2 mt-10'>

        <div class='flex flex-col mx-3 lg:flex-row gap-3   items-center lg:mx-12 '>
            <Select  class='rounded-xl p-3 px-5' label="Project">
                <Option>Employee</Option>
            </Select>
            <Select  class='rounded-xl p-3 px-5' label="Part">
                <Option>Employee</Option>
            </Select>
            <Button class='bg-white text-blue-300 border-blue-300 border-[1px] p-2 rounded-lg'>Import Est histo</Button>
            <div class='flex flex-row justify-center items-center gap-2'>
                Project Color <div class='w-10 rounded-md h-6 bg-black'></div>
            </div>
            <Select  class='rounded-xl p-3 px-5' label="Part">
                <Option>Employee</Option>
            </Select>
            <Button class='bg-white text-blue-300 border-blue-300 border-[1px] p-2 rounded-lg'>Create new</Button>
            <Button class='bg-white text-blue-300 border-blue-300 border-[1px] p-2 rounded-lg'>Save</Button>
            <Button class='bg-white text-blue-300 border-blue-300 border-[1px] p-2 rounded-lg'>Run algoritm</Button>
        </div>
        <div class='ml-4 lg:mrx-2 flex flex-row gap-2'>
        <table class=" border-collapse border border-gray-300">
        <thead>
                <tr class="border-2 bg-gray-700 h-10 text-white " >
                    <th colspan="5">Task Name</th>
                </tr>
                <tr>
                    <th class='bg-white text-white h-16 '>dddd</th>
                </tr>
            </thead>
            <tbody id="attendees-list">
                <tr>
                    <td class="border border-gray-300 px-2 py-2">
                        task name
                    </td>
                </tr>
            </tbody>
        </table>
        <table class=" border-collapse border border-gray-300">
        <thead>
                 <tr class="mainheaders  editable-table bg-gray-700 text-white">
                    <th colspan="7">Hours</th>
                </tr>
                <tr>
                    <th class='bg-gray-300 broder-r-700 p-1'> Est </th>
                    <th class='bg-gray-300 broder-r-700 p-1'> DL </th>
                    <th class='bg-gray-300 broder-r-700 p-1'> RFI </th>
                    <th class='bg-gray-300 broder-r-700 p-1'> PD </th>
                    <th class='bg-gray-300 broder-r-700 p-1'> Buf </th>
                    <th class='bg-gray-300 broder-r-700 p-1'> Adj </th>
                    <th class='bg-gray-300 broder-r-700 p-1'> Plan </th>
                </tr>
            </thead>
            <tbody id="attendees-list">
                <tr>
                    <td class="border border-gray-300 px-2 py-2">
                      0
                    </td>
                    <td class="border border-gray-300 px-2 py-2">
                      0
                    </td> <td class="border border-gray-300 px-2 py-2">
                      0
                    </td> <td class="border border-gray-300 px-2 py-2">
                      0
                    </td> <td class="border border-gray-300 px-2 py-2">
                      0
                    </td> <td class="border border-gray-300 px-2 py-2">
                      0
                    </td> <td class="border border-gray-300 px-2 py-2">
                      0
                    </td>
                </tr>
            </tbody>
        </table>
        <table class=" border-collapse border border-gray-300">
        <thead>
                <tr class="border-2 bg-gray-700  text-white">
                   <th colspan="3">Supply & Completion Dates</th>
                </tr>
                <tr>
                    <th>Doc Supply</th>
                    <th width="20px">C%</th>
                    <th>Completion</th>
                </tr>
            </thead>
            <tbody id="attendees-list">
                <tr>
                    <td class="border border-gray-300 px-2 py-2">
                      14-19-2002
                    </td>
                    <td class="border border-gray-300 px-2 py-2">
                      14-19-2002
                    </td>
                    <td class="border border-gray-300 px-2 py-2">
                      14-19-2002
                    </td>
                </tr>
            </tbody>
        </table>
        <table class=" border-collapse border border-gray-300">
        <thead>
                 <tr class="mainheaders  editable-table bg-gray-700 text-white">
                    <th colspan="5">Priority & Team Size</th>
                </tr>
                <tr>
                    <th class='bg-gray-300 broder-r-700 p-1'>RAP</th>
                    <th class='bg-gray-300 broder-r-700 p-1'>Pri</th>
                    <th class='bg-gray-300 broder-r-700 p-1'>TS</th>
                    <th class='bg-gray-300 broder-r-700 p-1'>DD</th>
                    <th class='bg-gray-300 broder-r-700 p-1'>SP</th>
              
                </tr>
            </thead>
            <tbody id="attendees-list">
                <tr>
                    <td class="border border-gray-300 px-2 py-2">
                      0
                    </td>
                    <td class="border border-gray-300 px-2 py-2">
                      0
                    </td> 
                    <td class="border border-gray-300 px-2 py-2">
                      0
                    </td> 
                    <td class="border border-gray-300 px-2 py-2">
                      0
                    </td> 
                    <td class="border border-gray-300 px-2 py-2">
                      0
                    </td>
                </tr>
            </tbody>
        </table>
        <table class=" border-collapse border border-gray-300">
        <thead>
                <tr class="border-2 bg-gray-700 text-white ">
                    <th colspan="5">Allocation</th>
                </tr>
                <tr>
                    <th class='bg-gray-400'>Algorithim 1</th>
                    <th class='bg-gray-400'>Algorithim 2</th>
                    <th class='bg-gray-400'>Override 1</th>
                    <th class='bg-gray-400'>Override 2</th>
                    <th class='bg-gray-400'>Override 3</th>
                </tr>
            </thead>
            <tbody id="attendees-list">
                <tr>
                    <td class="border border-gray-300 px-2 py-2">
                    14-19-2002
                    </td>
                    <td class="border border-gray-300  py-2 text-center">
                    14-19-2002
                    </td>
                    <td class="border border-gray-300  py-2 text-center">
                    14-19-2002
                    </td>
                    <td class="border border-gray-300  py-2 text-center">
                    14-19-2002
                    </td>
                    <td class="border border-gray-300  py-2 text-center">
                    14-19-2002
                    </td>
                </tr>
            </tbody>
        </table>
        <table class=" border-collapse border border-gray-300">
           <thead>
                 <tr class="mainheaders  editable-table bg-gray-700 text-white">
                    <th colspan="6">Progress</th>
                </tr>
                <tr>
                    <th class='bg-gray-300 broder-r-700 p-1'>Plan</th>
                    <th class='bg-gray-300 broder-r-700 p-1'>Act</th>
                    <th class='bg-gray-300 broder-r-700 p-1'>left</th>
                    <th class='bg-gray-300 broder-r-700 p-1'>Updated</th>
                    <th class='bg-gray-300 broder-r-700 p-1'>%</th>
                    <th class='bg-gray-300 broder-r-700 p-1'>left</th>
                   
              
                </tr>
            </thead>
            <tbody id="attendees-list">
                <tr>
                    <td class="border border-gray-300 px-2 py-2">
                      0
                    </td>
                    <td class="border border-gray-300 px-2 py-2">
                      0
                    </td> 
                    <td class="border border-gray-300 px-2 py-2">
                      à
                    </td> 
                    <td class="border border-gray-300 px-2 py-2">
                    14/02/2014S
                    </td> 
                    <td class="border border-gray-300 px-2 py-2">
                      0
                    </td>
                    <td class="border border-gray-300 px-2 py-2">
                      0
                    </td>
                </tr>
            </tbody>
        </table>
        </div>
    </div>
    </div>
    </div>
  </div>
</div>

</body>
</html>