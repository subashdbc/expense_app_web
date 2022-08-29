<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useApi } from '../../api/axios_setting';
import { BarChart, useBarChart, DoughnutChart, useDoughnutChart } from "vue-chart-3";
import { Chart, registerables } from "chart.js";
import dayjs from 'dayjs';
import format from 'dayjs/plugin/customParseFormat'
dayjs.extend(format)

interface Widget {
  name: string;
  icon: string;
  color: string;
  amountAlias: string;
  loading: boolean;
}
const expenseLoading = ref(false)
const incomeloading = ref(false)
const module = reactive<any>({
  totalExp: 0,
  totalIncome: 0,
  monthExp: 0,
  monthIncome: 0,
  reloadPie: 0,
  reloadBar: 0,
  weekNumber: dayjs().format('YYYY-MM-DD'),
  barChart: {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        'rgb(255, 99, 132)',
        'rgb(255, 159, 64)',
        'rgb(255, 205, 86)',
        'rgb(75, 192, 192)',
        'rgb(54, 162, 235)',
        'rgb(153, 102, 255)',
        'rgb(201, 203, 207)'
      ],
      borderWidth: 1
    }]
  },
  pieChart: {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 205, 86)'
      ],
      hoverOffset: 4
    }]
  }
})

const widgets = computed<Widget[]>(() => [{
  name: `<b><i>${dayjs().format('MMM')}</i></b> Expense`,
  icon: 'fa-solid fa-indian-rupee-sign',
  color: 'linear-gradient(180deg, #5a63d4, #1922ae)',
  amountAlias: 'monthExp',
  loading: expenseLoading.value
}, {
  name: 'Total expenses',
  icon: 'fa-solid fa-indian-rupee-sign',
  color: 'linear-gradient(180deg, #ed5cb6, #842d95)',
  amountAlias: 'totalExp',
  loading: expenseLoading.value
}, {
  name: `<b><i>${dayjs().format('MMM')}</i></b> Income`,
  icon: 'fa-solid fa-indian-rupee-sign',
  color: 'linear-gradient(180deg, #59db5e, #1a7530)',
  amountAlias: 'monthIncome',
  loading: incomeloading.value
}, {
  name: 'Total income',
  icon: 'fa-solid fa-indian-rupee-sign',
  color: 'linear-gradient(180deg, #3795be, #18506a)',
  amountAlias: 'totalIncome',
  loading: incomeloading.value
}])
Chart.register(...registerables);

const { barChartProps, barChartRef } = useBarChart({
    chartData: module.barChart,
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    },
});

const { doughnutChartProps, doughnutChartRef } = useDoughnutChart({
    chartData: module.pieChart,
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    },
});

getTotalIncome()
getTotalExpense()
getCategoryData()
navigateWeek()

function getTotalIncome() {
  incomeloading.value = true
  useApi.get('/income/income_data')
    .then((result) => {
      const { month_income, total_income } = result.data || {}
      module.monthIncome = month_income
      module.totalIncome = total_income
    })
    .finally(() => {
      incomeloading.value = false
    })
}

function getTotalExpense() {
  expenseLoading.value = true
  useApi.get('/expenses/expense_data')
    .then((result) => {
      const { month_expense, total_expense } = result.data || {}
      module.monthExp = month_expense
      module.totalExp = total_expense
    })
    .finally(() => {
      expenseLoading.value = false
    })
}

function getMonthExpenseData(start: string, end: string) {
  useApi.post('/expenses/month_data', { startDate: start, endDate: end })
    .then((result) => {
      const { labels, data } = result.data || {}
      module.barChart.labels = labels
      module.barChart.datasets[0].data = [...data]
      barChartProps.value.chartData = module.barChart
      module.reloadBar++
    })
}

function getCategoryData() {
  useApi.get('/expenses/by_category')
    .then((result) => {
      const { labels, data } = result.data || {}
      module.pieChart.labels = labels
      module.pieChart.datasets[0].data = [...data]
      doughnutChartProps.value.chartData = module.pieChart
      module.reloadPie++
    })
}

function navigateWeek() {
  let week = module.weekNumber
  let start = dayjs(week).startOf('month').format('YYYY-MM-DD')
  let end = dayjs(week).endOf('month').format('YYYY-MM-DD')
  module.weekNumber = dayjs(start).format('MMMM / YYYY')
  getMonthExpenseData(start, end)
}

function addWeek() {
  let week = module.weekNumber
  let start = dayjs(week, 'MMMM / YYYY').add(1, 'month').startOf('month').format('YYYY-MM-DD')
  let end = dayjs(week, 'MMMM / YYYY').add(1, 'month').endOf('month').format('YYYY-MM-DD')
  module.weekNumber = dayjs(start).format('MMMM / YYYY')
  getMonthExpenseData(start, end)
}

function subtractWeek() {
  let week = module.weekNumber
  let start = dayjs(week, 'MMMM / YYYY').subtract(1, 'month').startOf('month').format('YYYY-MM-DD')
  let end = dayjs(week, 'MMMM / YYYY').subtract(1, 'month').endOf('month').format('YYYY-MM-DD')
  module.weekNumber = dayjs(start).format('MMMM / YYYY')
  getMonthExpenseData(start, end)
}
</script>
<template>
  <div class="q-ml-xs q-pa-sm">
    <div class="row q-mt-md">
      <div class="col-xs-12 col-sm-6 col-md-3 col-lg-3" :class="`${$q.screen.lt.md ? 'q-mt-sm' : ''}`" v-for="widget in widgets" :key="widget.name">
        <q-card class="my-card text-left text-white q-ml-sm shadow-6" :style="{ 'background-image': widget.color }">
          <q-card-section>
            <div class="text-h6" v-html="widget.name"></div>
            <div class="q-mt-xs text-right">
              <q-btn glossy :icon="widget.icon" class="text-subtitle1 border-class" />
              <q-btn glossy class="text-subtitle1 text-weight-bold">
                <q-spinner :color="widget.color" v-if="widget.loading"/>
                {{ module[widget.amountAlias] || 0 }}
              </q-btn>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <div class="row">
      <div class="col-xs-12 col-md-7 col-lg-8 q-mt-lg">
      <q-btn-group rounded>
        <q-btn color="secondary" rounded glossy size="sm" @click="subtractWeek" icon="fa-solid fa-chevron-left" />
        <q-btn color="primary" rounded glossy class="text-weight-bold" :label="module.weekNumber" />
        <q-btn color="secondary" rounded glossy size="sm" @click="addWeek" icon-right="fa-solid fa-chevron-right" />
      </q-btn-group>
        <BarChart v-if="module.reloadBar" v-bind="barChartProps" />
      </div>
      <div class="col-xs-12 col-md-5 col-lg-4 q-mt-lg">
        <DoughnutChart v-if="module.reloadPie" class="q-mt-lg" v-bind="doughnutChartProps" />
      </div>
    </div>
  </div>
</template>
<style>
.my-card {
  border-radius: 8px;
}
.border-class {
  border-top-left-radius: 18px;
  border-bottom-left-radius: 18px;
  padding: 7px;
}
</style>