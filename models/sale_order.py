from odoo import models, fields, api
from ethiopian_date import EthiopianDateConverter
from datetime import datetime
import logging

_logger = logging.getLogger(__name__)


class SaleOrder(models.Model):
    _inherit = 'sale.order'

    order_date_et = fields.Char(string='Order Date (ET)', compute='_compute_et_date', store=True)

    @api.depends('date_order')
    def _compute_et_date(self):
        for order in self:
            if order.date_order:
                try:
                    order_date = order.date_order.date() if isinstance(order.date_order, datetime) else order.date_order
                    et_date_tuple = EthiopianDateConverter.date_to_ethiopian(order_date)
                    order.order_date_et = f"{et_date_tuple[2]:02d}/{et_date_tuple[1]:02d}/{et_date_tuple[0]}"
                except Exception as e:
                    order.order_date_et = False
            else:
                order.order_date_et = False


    @api.onchange('order_date_et')
    def _onchange_purchase_date_et(self):
        for order in self:
            if order.order_date_et:
                try:
                    day, month, year = map(int, order.order_date_et.split('/'))
                    gregorian_date = EthiopianDateConverter.to_gregorian(year, month, day)
                    order.date_order = fields.Datetime.to_string(datetime.combine(gregorian_date, datetime.min.time()))
                except Exception as e:
                    _logger.error(f"Error converting Ethiopian date: {e}")