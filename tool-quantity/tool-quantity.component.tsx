import { Component, ViewChild } from "@angular/core";
import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import { CommonService } from "@app/shared/services/common.service";
import { Button, FlexBox } from "@ui5/webcomponents-react";
import React from "react";
import { Item } from "@app/shared/models/item.model";
import { ItemImageComponent } from "@app/modules/machine-board/item-image/item-image.component";
import BadPartReason from "@app/shared/models/bad-part-reason.model";
import { User } from "@app/shared/models/user.model";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "@app/shared/services/auth.service";
import Toast from "@ui5/webcomponents/dist/Toast";

@Component({
	selector: "app-tool-quantity",
	templateUrl: "./tool-quantity.component.html",
	styleUrl: "./tool-quantity.component.css",
})
export class ToolQuantityComponent {
	isCreateDialogOpen: boolean = false;
	currentTableData: any;
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	@ViewChild("operationDialog") itemImageComponent?: ItemImageComponent;
	OrderData: any = [];
	orderPosArray: string[] = [];
	badPartReasons: BadPartReason[] = [];
	scrapPartAmounts: number[] | string[] = [];
	itemOnOrderSelect!: any[];
	item!: Item;
	isSerialViewVisible: boolean = false;
	isDefaultView: boolean = true;
	isBatchView: boolean = false;
	goodPartAmount: number | undefined | string = "";
	editedScrapPartReason!: number;
	editedGoodPartAmount: number | undefined | string = "";
	isDataChanged: boolean = false;
	errorStatus!: string;
	isClockedIn!: boolean;
	DeleteId?: number;
	editedValue: any;
	editedScrapPartAmount: number | undefined | string = "";
	quantityPage: string = $localize`Add Quantity`;
	EditItems: boolean = false;
	toasterStatus!: string;
	loggedInUser: User | undefined;
	isDeleteDialog!: boolean;
	rowDeleteId!: number
	button: string = $localize`Save`;
	columns: any = [
		{
			Header: $localize`Date`,
			accessor: "date_key",
			hAlign: "Right",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			disableResizing: false,
		},
		{
			Header: $localize`Good Parts`,
			accessor: "good",
			hAlign: "Right",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			disableResizing: false,
		},
		{
			Header: $localize`Scrap Parts`,
			accessor: "bad",
			hAlign: "Right",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			disableResizing: false,
		},
		{
			Header: $localize`Order`,
			accessor: "order",
			hAlign: "Right",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			disableResizing: false,
		},
		{
			Header: $localize`Scrap Parts Reason`,
			accessor: "bad_part_reason_name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			disableResizing: false,
		},
		{
			Header: $localize`Employee`,
			accessor: "user_name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			disableResizing: false,
		},
	];

	constructor(private commonService: CommonService, private authService: AuthService) {}

	ngOnInit() {
		this.getData();
		this.getUserId();
	}

	showBatchView(): void {
		this.isBatchView = true;
		this.isSerialViewVisible = false;
		this.isDefaultView = false;
	}

	showSerialView(): void {
		this.isBatchView = false;
		this.isSerialViewVisible = true;
		this.isDefaultView = false;
	}

	showDefaultView(): void {
		this.isBatchView = false;
		this.isSerialViewVisible = false;
		this.isDefaultView = true;
	}

	getData() {
		this.commonService.get("quantity/20", false).subscribe({
			next: (d: any) => {
				this.currentTableData = d!.production_order[0]!.records;
				this.childComponent?.render();
				this.OrderData = d.production_order;

				this.itemOnOrderSelect = this.OrderData.map((order: any) => {
					const item = new Item().deserialize(order.items);
					return {
						id: item.id,
						custom_id: item.custom_id,
						name: item.name,
					};
				});

				this.badPartReasons = d.bad_part_reason;
				this.badPartReasons.forEach(v => {
					(this.scrapPartAmounts as any).push("");
				});
				this.getItemData(d.production_order[0].items.id);
			},
		});
	}

	getUserId() {
		this.loggedInUser = this.authService.getUser();
	}

	orderSelection(order_id: string, evt?: any) {
		const updateItems = () => {
			this.itemOnOrderSelect = this.OrderData.filter((order: any) =>
				this.orderPosArray.includes(order.order_pos)
			).map((order: any) => {
				const item = new Item().deserialize(order.items);
				return {
					id: item.id,
					custom_id: item.custom_id,
					name: item.name,
				};
			});
		};
	}

	onClick(order_id: string, evt?: any) {
		this.orderSelection(order_id, evt);
	}

	closeCreateDialog() {
		this.isCreateDialogOpen = false;
	}

	closeEditDialog() {
		this.EditItems = false;
	}

	openCreateDialog() {
		this.isCreateDialogOpen = true;
	}

	public filterHandler(
		fieldName: string = "",
		value: string = "",
		filterOperator: string = "Contain"
	) {
		this.childComponent?.onFilterAndSorting(fieldName, value, filterOperator);
	}

	deleteRecord(){
		this.commonService.delete(`quantity/${this.rowDeleteId}`, false).subscribe({
			next: (response: any) => {
				console.log(response);
				this.getData();
				this.isDeleteDialog = false;
				const deleteToast = document.getElementById("deleteToast") as Toast;
				deleteToast.show();
				this.filterHandler();
			},
			error: (error: any) => {
				console.error("Error:", error);
			},
		});
	}



	onDelete(value: any) {
		console.log(value.id);
		this.isDeleteDialog = true;
		this.rowDeleteId = value.id;
		
	}

	validateGoodPartAmount(): boolean {
		if (this.goodPartAmount == "") {
			return true;
		}

		const amount = Number(this.goodPartAmount);
		if (isNaN(amount) || amount < 1 || !Number.isInteger(amount)) {
			this.isDataChanged = false;
			return false;
		} else {
			if (this.goodPartAmount != "") {
				this.isDataChanged = true;
			}
			return true;
		}
	}

	validateScrapPartAmount(index: number): boolean {
		if (this.scrapPartAmounts[index] == "") {
			return true;
		}

		const amount = Number(this.scrapPartAmounts[index]);
		if (isNaN(amount) || amount < 1 || !Number.isInteger(amount)) {
			this.isDataChanged = false;
			return false;
		} else {
			if (this.scrapPartAmounts[index] != "") {
				this.isDataChanged = true;
			}
			return true;
		}
	}

	validateAllInputs(): boolean {
		this.isDataChanged = false;

		if (this.validateGoodPartAmount() == false) {
			return false;
		}

		for (let i = 0; i < this.scrapPartAmounts.length; i++) {
			if (this.validateScrapPartAmount(i) == false) {
				return false;
			}
		}

		return this.isDataChanged;
		
	}

	onSave() {
		if (this.validateAllInputs()) {
			const dataToSend = this.buildDataToSend();
			this.commonService.post(`quantity/20`, dataToSend, false).subscribe({
				next: (response: any) => {
					console.log(response);
					this.getData();
					this.goodPartAmount = "";
					this.badPartReasons.forEach((reason: any, reasonIndex) => {
						this.scrapPartAmounts[reasonIndex] = "";
					});
					this.isDataChanged = false;
				},
				error: (error: any) => {
					console.error("Error:", error);
				},
			});
		}
	}

	buildDataToSend(): any[] {
		const dataToSend: any[] = [];
		if (this.goodPartAmount) {
			dataToSend.push({
				prod_order_pos_operation_id: 140,
				user_id: "60",
				bad_part_reason_id: "",
				quantity: this.goodPartAmount,
				item_id: 5516,
				serial: "",
				batch: "",
				stockable_type: "ProdOrderPosOperation::class",
				positionable_id: "",
				positionable_type: "",
				
			});
			this.goodPartAmount = "";
		}
		this.badPartReasons.forEach((reason: any, index) => {
			if (this.scrapPartAmounts[index]) {
				dataToSend.push({
					prod_order_pos_operation_id: 140,
					user_id: "60",
					bad_part_reason_id: reason.id,
					quantity: this.scrapPartAmounts[index],
					item_id: 5516,
					serial: "",
					batch: "",
					stockable_type: "ProdOrderPosOperation::class",
					positionable_id: "",
					positionable_type: "",
					
				});
				this.scrapPartAmounts[index] = "";
			}
		});

		return dataToSend;
	}

	editClick(event: any) {
		this.EditItems = true;
		this.editedValue = event;
		this.editedGoodPartAmount = this.editedValue.good;
		this.editedScrapPartAmount = this.editedValue.bad;
	}

	saveEdit() {
		let editedData: any;
		editedData = {
			machine_id: 20,
			prod_order_pos_operation_id: 140,
			user_id: 60,
			bad_part_reason_id: null,
			quantity: this.editedValue.quantity,
			new_quantity: this.editedGoodPartAmount || this.editedScrapPartAmount,
			confirmed_datetime: this.editedValue.confirmed_datetime,
			new_bad_part_reason_id: null,
			item_id: 5516,
			stockable_type: "ProdOrderPosOperation::class",
			positionable_id: "",
			positionable_type: "",
		};

		console.log(editedData);
		console.log(this.editedValue.id);
		this.commonService.put(`quantity/${this.editedValue.id}`, editedData, false).subscribe({
			next: (res: any) => {
				this.EditItems = false;
				this.getData();
				this.editedGoodPartAmount = "";
				this.editedScrapPartAmount = "";
				console.log(res);
			},
			error: (err: any) => {
				console.log(err);
			},
		});
	}

	getItemData(id: any) {
		this.item = new Item().deserialize({ id: id });
		this.itemImageComponent?.getMedia();
	}

	closeDeleteDialog(){
		this.isDeleteDialog = false
	}
}
