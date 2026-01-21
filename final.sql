create database final;
use final;

-- Phần 1:
--  BẢNG 1: SHIPPERS
create table shippers(
	shipper_id int primary key auto_increment,
    full_name varchar(100) not null,
    phone_number varchar(15) not null unique,
    license_type varchar(10) not null,
    rating decimal(3,1) default(5.0) check(rating between 0.0 and 5.0)
);
-- BẢNG 2: VEHICLE_DETAILS
 create table vehicle_details(
	vehicle_id int primary key auto_increment,
    shipper_id int not null,
    license_plate varchar(50) not null,
    vehicle_type enum('Truck','Motorbike','Container') not null,
    max_payload decimal(10,2) check(max_payload > 0),
    foreign key(shipper_id) references shippers(shipper_id)
 );
 -- BẢNG 3: SHIPMENTS
 create table shipments(
	shipment_id int primary key auto_increment,
    product_name varchar(100) not null,
    weight decimal(10,2) check(weight > 0),
    goods_value decimal(15,2) check(goods_value > 0),
	status enum('In Transit','Delivered','Returned') not null
 );
 -- BẢNG 4: DELIVERY_ORDERS
 create table delivery_orders(
	order_id int primary key auto_increment,
    shipment_id int not null,
    shipper_id int not null,
    order_date datetime default current_timestamp,
    delivery_fee decimal(10,2) check(delivery_fee > 0),
    status enum('Pending','Processing','Finished'),
    foreign key(shipment_id) references shipments(shipment_id),
    foreign key(shipper_id) references shippers(shipper_id)
 );
 -- BẢNG 5: DELIVERY_LOG
 create table delivery_log(
	log_id int primary key auto_increment,
    order_id int not null,
    current_location varchar(100) not null,
    log_time datetime not null,
    note varchar(100),
    foreign key(order_id) references delivery_orders(order_id)
 );
 
 -- PHẦN 2: DML – INSERT, UPDATE, DELETE
 -- Câu 1 – INSERT
 insert shippers(shipper_id,full_name,phone_number,license_type,rating) values
 ('1','Nguyen Van An',0901234567,'C','4.8'),
 ('2','Tran Thi Binh',0912345678,'A2','5'),
 ('3','Le Hoang Nam',0983456789,'FC','4.2'),
 ('4','Pham Minh Duc',0354567890,'B2','4.9'),
 ('5','Hoang Quoc Viet',0775678901,'C','4.7');
  
 insert vehicle_details(vehicle_id,shipper_id,license_plate,vehicle_type,max_payload ) values
 ('101','1','29C-123.45','Truck',3500),
 ('102','2','59A-888.88','Motorbike',500),
 ('103','3','15R-999.99','Container',32000),
 ('104','4','30F-111.22','Truck',1500),
 ('105','5','43C-444.55','Truck',5000);
 
 insert shipments(shipment_id,product_name,weight,goods_value,status) values
 ('5001','Smart TV Samsung 55 inch',25.5,'15000000','In Transit'),
 ('5002','Laptop Dell XPS',2,'35000000','Delivered'),
 ('5003','Industrial Air Compressor',450,'120000000','In Transit'),
 ('5004','Imported Fruit Boxes',15,'2500000','Returned'),
 ('5005','LG Inverter Washing Machine',70,'9500000','In Transit');
 
 insert delivery_orders(order_id,shipment_id,shipper_id,order_date,delivery_fee,status) values
 ('9001','5001','1','2024-5-20 8:00',2000000,'Processing'),
 ('9002','5002','2','2024-5-20 9:30',3500000,'Finished'),
 ('9003','5003','3','2024-5-20 10:15',2500000,'Processing'),
 ('9004','5004','4','2024-5-21 7:00',1500000,'Finished'),
 ('9005','5005','5','2024-5-21 8:45',2500000,'Pending');
 
 insert delivery_log(log_id,order_id,current_location,log_time,note) values
 ('1','9001','Main Warehouse - Hanoi','2024-5-15 8:15','Departed'),
 ('2','9001','Phu Ly Toll Station','2024-5-17 10:00','In transit'),
 ('3','9002','District 1 - HCM','2024-5-19 10:30','Arrived'),
 ('4','9003','Hai Phong Port','2024-5-20 11:00','Departed'),
 ('5','9004','Return Warehouse - Da Nang','2024-5-21 14:00','Returned');
 
 -- Câu 2 – UPDATE & DELETE
update delivery_orders do
join shipments s on do.shipment_id = s.shipment_id
set do.delivery_fee = do.delivery_fee * 1.1
where do.status = 'Finished'
and s.weight > 100;

delete from delivery_log
where log_time < '2024-05-17 00:00:00';

-- PHẦN 3: TRUY VẤN CƠ BẢN
-- Câu 1:
select license_plate, vehicle_type, max_payload from vehicle_details where max_payload > 5000 or vehicle_type = "Container";
-- Câu 2:
select full_name,phone_number  from shippers where rating between 4.5 and 5.0 and phone_number like '090%';
-- Câu 3:
select shipment_id,product_name,goods_value from shipments order by goods_value desc limit 2 offset 2;

-- PHẦN 4: TRUY VẤN NÂNG CAO
-- Câu 1:
select s.full_name, sh.shipment_id,sh.product_name, do.delivery_fee, do.order_date from delivery_orders do
join shippers s on s.shipper_id = do.shipper_id
join shipments sh on sh.shipment_id = do.shipment_id;
-- Câu 2:
select s.full_name, sum(do.delivery_fee) as total_fee
from shippers s
join delivery_orders do on do.shipper_id = s.shipper_id
group by s.shipper_id, s.full_name
having total_fee > 3000000;

-- Câu 3:
select shipper_id, full_name, rating
from shippers
where rating = (
    select max(rating) from shippers
);


-- PHẦN 5: INDEX & VIEW 
-- Câu 1:
create index ix_shipments on shipments(goods_value,status);
-- Câu 2:
create view vw_shippers as
select 
    s.full_name,count(do.order_id) as total_order,sum(do.delivery_fee) as total_fee
from shippers s
join delivery_orders do on s.shipper_id = do.shipper_id
where do.status <> 'Returned'
group by s.shipper_id, s.full_name;


-- PHẦN 6: TRIGGER
delimiter //

create trigger tg_destination
after update on delivery_orders
for each row
begin
    if new.status = 'Finished' and old.status <> 'Finished' then
        insert into delivery_log(order_id, current_location, note, log_time)
        values (new.order_id,'Destination','Delivery completed',current_timestamp);
    end if;
end//
delimiter ;





