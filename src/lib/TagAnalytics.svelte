<script>
  import Fa from "svelte-fa";
  import Line from "svelte-chartjs/src/Line.svelte";
  import {
    faChartLine,
    faChartPie,
    faChartGantt,
    faChartSimple,
    faUserClock,
    faClockFour,
  } from "@fortawesome/free-solid-svg-icons";
  import { collection, doc, orderBy, query, where } from "firebase/firestore";
  import { collectionData, docData } from "rxfire/firestore";

  import { auth, firestore } from "../firebase";
  import { startWith } from "rxjs/operators";
  import { onMount } from "svelte";
  import Footer from "./Footer.svelte";

  export let params;

  const { id } = params;

  let user = auth.currentUser;

  const tagRef = doc(firestore, `tags`, id);

  const tag = docData(tagRef, { idField: "id" });

  const invokesRef = query(
    collection(firestore, "invokes"),
    where("tag", "==", id),
    where(
      "timestamp",
      ">=",
      +new Date(Date.now() - 1000 * 60 * 60 * 24 * 7 * 31)
    ),
    orderBy("timestamp", "desc")
  );

  let labels;

  let uses,
    weeklyUses,
    users,
    channels,
    usageChart,
    topUsers = [],
    topChannels = [],
    latest = [],
    latestArgs = false,
    dropDown = true,
    selectedData = null,
    selectOptions = ["Hourly", "Weekly"],
    selectedGraph = selectOptions[0],
    hourlyInvokes = {},
    dailyInvokes = {};
  $: {
    if (selectedGraph == "Hourly") {
      selectedData = hourlyInvokes;
      labels = Object.keys(hourlyInvokes);
    } else {
      selectedData = dailyInvokes;
      labels = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ].slice(0, Object.keys(dailyInvokes).length);
    }
  }
  const invokes = collectionData(invokesRef, { idField: "id" }).pipe(
    startWith([])
  );

  invokes.subscribe((invokes) => {
    uses = invokes.length;
    latest = invokes.slice(0, 5);
    latestArgs = latest.find((i) => i.args) !== undefined;
    for (const x of invokes) {
      console.log(
        new Date(x.timestamp).toLocaleString("en-un", { weekday: "long" })
      );
    }

    dailyInvokes = invokes
      .map((i) => new Date(i.timestamp).getDay())
      .reduce((acc, day) => {
        if (!acc[day]) {
          acc[day] = 0;
        }
        acc[day]++;
        return acc;
      }, {});
    for (
      let i = 0;
      i < Math.max(...Object.keys(dailyInvokes).map(parseInt));
      i++
    ) {
      if (!dailyInvokes[i]) {
        dailyInvokes[i] = 0;
      }
    }

    console.log(dailyInvokes, Object.values(dailyInvokes));
    hourlyInvokes = invokes
      .filter((i) => i.timestamp > Date.now() - 1000 * 60 * 60 * 24)
      .reduce((acc, i) => {
        console.log(new Date(i.timestamp).toTimeString());
        let hour = "" + new Date(i.timestamp).getHours();
        console.log(hour);
        if (!acc[hour]) {
          acc[hour] = 0;
        }
        acc[hour]++;
        return acc;
      }, {});
    selectedData = hourlyInvokes;
    weeklyUses = invokes.filter(
      (i) => i.timestamp >= +new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
    ).length;
    users = invokes
      .map((invoke) => invoke.author_id)
      .filter((id, i, self) => self.indexOf(id) === i);

    const occurrences = invokes
      .map((i) => i.author_name)
      .reduce(function (acc, curr) {
        return acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc;
      }, {});
    topUsers = Object.keys(occurrences)
      .map((key) => ({
        name: key,
        id: invokes.find((i) => i.author_name === key).author_id,
        icon: invokes.find((i) => i.author_name === key).author_icon,
        percent: Math.round((occurrences[key] / uses) * 100),
        count: occurrences[key],
      }))
      .slice(0, 5);
    topUsers.sort((a, b) => b.count - a.count);
    console.log("u:", topUsers);
    channels = invokes
      .map((invoke) => invoke.channel_id)
      .filter((id, i, self) => self.indexOf(id) === i);

    const occurrences2 = invokes
      .map((i) => i.channel_name)
      .reduce(function (acc, curr) {
        return acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc;
      }, {});
    topChannels = Object.keys(occurrences2)
      .map((key) => ({
        name: key,
        percent: Math.round((occurrences2[key] / uses) * 100),
        count: occurrences2[key],
      }))
      .slice(0, 5);
    topChannels.sort((a, b) => b.count - a.count);
  });

  function timeDifference(current, previous) {
    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
      return Math.round(elapsed / 1000) + " seconds ago";
    } else if (elapsed < msPerHour) {
      return Math.round(elapsed / msPerMinute) + " minutes ago";
    } else if (elapsed < msPerDay) {
      return Math.round(elapsed / msPerHour) + " hours ago";
    } else if (elapsed < msPerMonth) {
      return "approximately " + Math.round(elapsed / msPerDay) + " days ago";
    } else if (elapsed < msPerYear) {
      return (
        "approximately " + Math.round(elapsed / msPerMonth) + " months ago"
      );
    } else {
      return "approximately " + Math.round(elapsed / msPerYear) + " years ago";
    }
  }

  let current = Date.now();
  onMount(async () => {
    setInterval(() => {
      current = Date.now();
    }, 1000);
  });
</script>

{#if user && $tag}
  <section class="text-gray-404 body-font">
    <div
      class="container mx-auto flex px-5 py-4 items-center justify-center flex-col"
    >
      <div class="flex flex-col text-center w-full">
        <h1
          class="sm:text-4xl text-2xl font-medium title-font mb-4 text-orange-404"
        >
          {$tag.name}
        </h1>
      </div>
    </div>
    <section id="quickBits" class="mt-3">
      <div class="px-4 md:px-10 mx-auto w-full">
        <div class="flex flex-wrap">
          <div class="w-full lg:w-6/12 xl:w-3/12 px-4">
            <div
              class="relative flex flex-col min-w-0 break-words bg-slate-900 rounded mb-6 xl:mb-0 shadow-lg"
            >
              <div class="flex-auto p-4">
                <div class="flex flex-wrap">
                  <div class="relative w-full pr-4 max-w-full flex-grow flex-1">
                    <h5 class="text-blueGray-400 uppercase font-bold text-xs">
                      WEEKLY USES
                    </h5>
                    <span class="font-semibold text-xl text-blueGray-700"
                      >{weeklyUses}</span
                    >
                  </div>
                  <div class="relative w-auto pl-4 flex-initial">
                    <div
                      class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-emerald-500"
                    >
                      <Fa icon={faChartGantt} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="w-full lg:w-6/12 xl:w-3/12 px-4">
            <div
              class="relative flex flex-col min-w-0 break-words bg-slate-900 rounded mb-6 xl:mb-0 shadow-lg"
            >
              <div class="flex-auto p-4">
                <div class="flex flex-wrap">
                  <div class="relative w-full pr-4 max-w-full flex-grow flex-1">
                    <h5 class="text-blueGray-400 uppercase font-bold text-xs">
                      MONTHLY USES
                    </h5>
                    <span class="font-semibold text-xl text-blueGray-700"
                      >{uses}</span
                    >
                  </div>
                  <div class="relative w-auto pl-4 flex-initial">
                    <div
                      class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-orange-404"
                    >
                      <Fa icon={faChartLine} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="w-full lg:w-6/12 xl:w-3/12 px-4">
            <div
              class="relative flex flex-col min-w-0 break-words bg-slate-900 rounded mb-6 xl:mb-0 shadow-lg"
            >
              <div class="flex-auto p-4">
                <div class="flex flex-wrap">
                  <div class="relative w-full pr-4 max-w-full flex-grow flex-1">
                    <h5 class="text-blueGray-400 uppercase font-bold text-xs">
                      USERS
                    </h5>
                    <span class="font-semibold text-xl text-blueGray-700"
                      >{users.length}</span
                    >
                  </div>
                  <div class="relative w-auto pl-4 flex-initial">
                    <div
                      class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-cyan-500"
                    >
                      <Fa icon={faChartPie} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="w-full lg:w-6/12 xl:w-3/12 px-4">
            <div
              class="relative flex flex-col min-w-0 break-words bg-slate-900 rounded mb-6 xl:mb-0 shadow-lg"
            >
              <div class="flex-auto p-4">
                <div class="flex flex-wrap">
                  <div class="relative w-full pr-4 max-w-full flex-grow flex-1">
                    <h5 class="text-blueGray-400 uppercase font-bold text-xs">
                      CHANNELS
                    </h5>
                    <span class="font-semibold text-xl text-blueGray-700"
                      >{channels.length}</span
                    >
                  </div>
                  <div class="relative w-auto pl-4 flex-initial">
                    <div
                      class="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-indigo-500"
                    >
                      <Fa icon={faChartSimple} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div class="flex flex-wrap mt-4">
          <div class="w-full xl:w-8/12 mb-12 xl:mb-0 px-4">
            <div
              class="relative flex flex-col min-w-0 break-words bg-slate-900 w-full mb-6 shadow-lg rounded"
            >
              <div class="rounded-t mb-0 px-4 py-3 border-0">
                <button
                  id="dropdownBottomButton"
                  on:click={() =>
                    (selectedGraph = selectOptions.find(
                      (v) => v != selectedGraph
                    ))}
                  class="mr-3 mb-3 md:mb-0 text-white bg-slate-800 font-medium rounded-md text-sm px-4 py-2.5 text-center inline-flex items-center"
                  type="button"
                  >{selectedGraph}
                  <Fa
                    class="ml-2"
                    icon={selectedGraph == selectOptions[0]
                      ? faUserClock
                      : faClockFour}
                  /></button
                >
                <div
                  id="dropdownBottom"
                  hidden={dropDown}
                  class="z-10 bg-white divide-y fixed divide-gray-100 rounded shadow w-44 dark:bg-gray-700"
                >
                  <ul
                    class="py-1 text-sm text-gray-700 dark:text-gray-200"
                    aria-labelledby="dropdownBottomButton"
                  >
                    {#each selectOptions as option (option)}
                      {#if option != selectedGraph}
                        <li>
                          <button
                            on:click={() => {
                              selectedGraph = option;
                              dropDown = !dropDown;
                            }}
                            class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                            >{option}</button
                          >
                        </li>
                      {/if}
                    {/each}
                  </ul>
                </div>
                <div id="usage-chart">
                  <div class="relative w-full px-4 max-w-full flex-grow flex-1">
                    <div class="h-full">
                      <Line
                        data={{
                          labels,
                          datasets: [
                            {
                              data: Object.values(selectedData),
                              fill: true,
                              label: "uses",
                              lineTension: 0.3,
                              backgroundColor: "rgba(252, 163, 17, 0.1)",
                              borderColor: "rgb(252, 163, 17)",
                              pointBackgroundColor: "rgb(252 163 17)",
                              pointBorderWidth: 5,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          legend: {
                            display: false,
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div class="flex flex-wrap mt-4">
          <div class="w-full xl:w-8/12 mb-12 xl:mb-0 px-4">
            <div
              class="relative flex flex-col min-w-0 break-words bg-slate-900 w-full mb-6 shadow-lg rounded"
            >
              <div class="rounded-t mb-0 px-4 py-3 border-0">
                <div class="flex flex-wrap items-center">
                  <div class="relative w-full px-4 max-w-full flex-grow flex-1">
                    <h3 class="font-semibold text-base text-blueGray-700">
                      Top Users
                    </h3>
                  </div>
                </div>
              </div>
              <div class="block w-full overflow-x-auto">
                <table
                  class="items-center w-full bg-transparent border-collapse"
                >
                  <thead
                    ><tr
                      ><th
                        class="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left"
                        >User</th
                      >
                      <th
                        class="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left"
                        >Uses</th
                      >
                      <th
                        class="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left"
                        >%</th
                      ></tr
                    ></thead
                  >
                  <tbody>
                    {#each topUsers as { name, icon, count, percent }}
                      <tr>
                        <th
                          class="flex border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-3 text-left"
                          ><div class="flex-none w-6 h-6 mr-2">
                            {#if icon}
                              <img
                                class="rounded-full w-full h-full"
                                src={icon}
                                alt="'Logo for guild ' + guild.name"
                              />
                            {:else}
                              <div
                                class="bg-gray-700 rounded-full w-full h-full"
                              />
                            {/if}
                          </div>
                          <p class="py-1">{name}</p>
                        </th>
                        <td
                          class="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap"
                          >{count}</td
                        ><td
                          class="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4"
                          ><div class="flex items-center">
                            <span class="mr-2">{percent}%</span>
                            <div class="relative w-full">
                              <div
                                class="overflow-hidden h-2 text-xs flex rounded bg-indigo-300"
                              >
                                <div
                                  style="width: {percent}%;"
                                  class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                                />
                              </div>
                            </div>
                          </div>
                        </td></tr
                      >
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="w-full xl:w-4/12 px-4 lg:mt-4">
            <div
              class="relative flex flex-col min-w-0 break-words bg-slate-900 w-full mb-6 shadow-lg rounded"
            >
              <div class="rounded-t mb-0 px-4 py-3 border-0">
                <div class="flex flex-wrap items-center">
                  <div class="relative w-full px-4 max-w-full flex-grow flex-1">
                    <h3 class="font-semibold text-base text-blueGray-700">
                      Top Channels
                    </h3>
                  </div>
                </div>
              </div>
              <div class="block w-full overflow-x-auto">
                <table
                  class="items-center w-full bg-transparent border-collapse"
                >
                  <thead class="thead-light"
                    ><tr
                      ><th
                        class="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left"
                        >Channnel</th
                      >
                      <th
                        class="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left"
                        >Uses</th
                      >
                      <th
                        class="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left min-w-140-px"
                      /></tr
                    ></thead
                  >
                  <tbody>
                    {#each topChannels as { name, count, percent }}
                      <tr
                        ><th
                          class="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left"
                          >#{name}</th
                        >
                        <td
                          class="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4"
                          >{count}</td
                        >
                        <td
                          class="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4"
                          ><div class="flex items-center">
                            <span class="mr-2">{percent}%</span>
                            <div class="relative w-full">
                              <div
                                class="overflow-hidden h-2 text-xs flex rounded bg-red-200"
                              >
                                <div
                                  style="width: {percent}%;"
                                  class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                                />
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="w-full xl:w-8/12 xl:mb-0 px-4">
            <div
              class="transform-all duration-300 ease-in-out relative flex flex-col min-w-0 break-words bg-slate-900 w-full mb-6 shadow-lg rounded"
            >
              <div class="rounded-t mb-0 px-4 py-3 border-0">
                <div class="flex flex-wrap items-center">
                  <div class="relative w-full px-4 max-w-full flex-grow flex-1">
                    <h3 class="font-semibold text-base text-blueGray-700">
                      Recent Commands
                    </h3>
                  </div>
                </div>
              </div>
              <div class="block w-full overflow-x-auto">
                <table
                  class="items-center w-full bg-transparent border-collapse"
                >
                  <thead
                    ><tr>
                      <th
                        class="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left"
                        >Time</th
                      >
                      <th
                        class="px-6 hidden lg:visible bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left"
                        >Server</th
                      >
                      <th
                        class="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left"
                        >Channel</th
                      >
                      <th
                        class="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left"
                        >User</th
                      >
                      {#if latestArgs}
                        <th
                          class="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left"
                          >Args</th
                        >
                      {/if}
                    </tr>
                  </thead>
                  <tbody>
                    {#each latest as { guild_name, channel_name, author_name, author_icon, args, timestamp } (timestamp)}
                      <tr>
                        <th
                          class="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left"
                          >{timeDifference(current, timestamp)}</th
                        >
                        <th
                          class="border-t-0 hidden lg:visible px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left"
                          >{guild_name}</th
                        >
                        <td
                          class="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4"
                          >#{channel_name}</td
                        >
                        <td
                          class="border-t-0 px-6 flex first-line:align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4"
                          ><div class="flex-none w-6 h-6 mr-2">
                            {#if author_icon}
                              <img
                                class="rounded-full w-full h-full"
                                src={author_icon}
                                alt="'Logo for guild ' + guild.name"
                              />
                            {:else}
                              <div
                                class="bg-gray-700 rounded-full w-full h-full"
                              />
                            {/if}
                          </div>
                          {author_name}</td
                        >
                        {#if latestArgs}
                          <td
                            class="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4"
                            >{args}</td
                          >
                        {/if}
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </section>
  </section>
{/if}
