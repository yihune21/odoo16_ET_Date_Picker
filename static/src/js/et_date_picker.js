// @odoo-module
import { registry } from "@web/core/registry";
import { standardFieldProps } from "@web/views/fields/standard_field_props";
import {
  Component,
  useState,
  onWillStart,
  onMounted,
  useEffect,
} from "@odoo/owl";
import { EthiopianDate } from "./ethiopian_date";

class DateTimeEthiopiaField extends Component {
  static template = "ethiopian_date_picker.DateTimeEthiopiaField";
  static props = { ...standardFieldProps };

  setup() {
    this.ETHIOPIAN_MONTHS = [
      "መስከረም",
      "ጥቅምት",
      "ህዳር",
      "ታህሳስ",
      "ጥር",
      "የካቲት",
      "መጋቢት",
      "ሚያዝያ",
      "ግንቦት",
      "ሰኔ",
      "ሐምሌ",
      "ነሐሴ",
      "ጳጉሜ",
    ];
    this.ETHIOPIAN_DAYS = ["እሁድ", "ሰኞ", "ማክሰኞ", "እሮብ", "ሐሙስ", "አርብ", "ቅዳሜ"];
    this.state = useState({
      inputValue: "",
      showCalendar: false,
      currentYear: 0,
      currentMonth: 0,
      currentDay: 0,
      selectedDate: null,
    });

    onWillStart(async () => {
      this.initializeDate();
    });

    onMounted(() => {
      this.formatDate();
    });

    useEffect(
      () => {
        this.syncWithOdooField();
      },
      () => [this.props.value]
    );
  }

  initializeDate = () => {
    const today = new Date();
    const ethiopianDate = EthiopianDate.fromGregorian(today);
    this.state.currentYear = ethiopianDate.year;
    this.state.currentMonth = ethiopianDate.month - 1;
    this.state.currentDay = ethiopianDate.day;
    this.state.inputValue = ethiopianDate.format();
  };

  formatDate = () => {
    if (this.props.value) {
      const date = new Date(this.props.value);
      if (!isNaN(date.getTime())) {
        const ethiopianDate = EthiopianDate.fromGregorian(date);
        this.state.inputValue = ethiopianDate.format();
        this.state.selectedDate = ethiopianDate;
      } else {
        this.resetState();
      }
    } else {
      this.resetState();
    }
  };

  resetState = () => {
    this.state.inputValue = "";
    this.state.selectedDate = null;
    this.state.currentYear = new Date().getFullYear();
    this.state.currentMonth = new Date().getMonth();
  };

  onInputClick = () => {
    this.state.showCalendar = !this.state.showCalendar;
  };

  changeMonth = (delta) => {
    let newMonth = this.state.currentMonth + delta;
    let newYear = this.state.currentYear;

    if (newMonth > 12) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 12;
      newYear--;
    }

    this.state.currentMonth = newMonth;
    this.state.currentYear = newYear;
    this.state.showCalendar = true;
  };

  syncWithOdooField() {
    const odooFieldValue = this.props.value;
    console.log("odooFieldValue:", odooFieldValue);

    if (
      odooFieldValue &&
      (!this.state.selectedDate ||
        this.state.selectedDate.toGregorian().toISOString() !== odooFieldValue)
    ) {
      const [day, month, year] = odooFieldValue.split("/");
      const gregorianDate = new EthiopianDate(year, month, day).toGregorian();
      if (!isNaN(gregorianDate.getTime())) {
        try {
          const ethiopianDate = EthiopianDate.fromGregorian(gregorianDate);
          if (
            ethiopianDate &&
            ethiopianDate.year &&
            ethiopianDate.month &&
            ethiopianDate.day
          ) {
            this.state.inputValue = ethiopianDate.format();
            this.state.selectedDate = ethiopianDate;
            this.state.currentYear = ethiopianDate.year;
            this.state.currentMonth = ethiopianDate.month - 1;
          } else {
            console.error("Invalid Ethiopian date");
          }
        } catch (error) {
          console.error("Error converting to Ethiopian date:", error);
        }
      } else {
        console.error("Invalid Gregorian date:", odooFieldValue);
      }
    }
  }

  onDateSelect = (day) => {
    const selectedDate = new EthiopianDate(
      this.state.currentYear,
      this.state.currentMonth + 1,
      day
    );
    const formattedEthiopianDate = selectedDate.format();

    this.state.inputValue = formattedEthiopianDate;
    this.state.selectedDate = selectedDate;
    this.state.showCalendar = false;

    this.props.update(formattedEthiopianDate);

    if (this.props.onchange) {
      this.props.onchange(formattedEthiopianDate);
    }
  };

  getDaysInMonth = (year, month) => {
    if (month < 12) {
      return Array.from({ length: 30 }, (_, i) => i + 1);
    } else {
      return Array.from({ length: year % 4 === 3 ? 6 : 5 }, (_, i) => i + 1);
    }
  };

  isToday = (day) => {
    const today = new Date();
    const ethiopianToday = EthiopianDate.fromGregorian(today);
    return (
      ethiopianToday.year === this.state.currentYear &&
      ethiopianToday.month === this.state.currentMonth + 1 &&
      ethiopianToday.day === day
    );
  };

  getDayOfWeek = (year, month, day) => {
    const ethiopianDate = new EthiopianDate(year, month + 1, day);
    const gregorianDate = ethiopianDate.toGregorian();
    return gregorianDate.getDay();
  };
}

registry.category("fields").add("date_et", DateTimeEthiopiaField);
