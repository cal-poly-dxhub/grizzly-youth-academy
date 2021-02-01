/*
drop table if exists ActionDateDeletions;
drop table if exists TemplateDeletions;
drop table if exists TemplateUpdates;
drop table if exists CompletedActions;
drop table if exists ActionTemplate;

drop table if exists ActionOptionDeletions;
drop table if exists ActionOption;
drop table if exists Goal;

drop table if exists Resource;
drop table if exists ResourceCategory;

drop table if exists CadetToNotification;
drop table if exists Notification;

drop table if exists CadetToEvent;
drop table if exists `Event`;

drop table if exists CadetToStaff;

drop table if exists Cadet;
drop table if exists Platoon;
drop table if exists Class;

drop table if exists Staff;
drop table if exists StaffType;
*/

/* PERSONS */
-------------------------------------------------------------------------------

create table Platoon (
    Id integer primary key auto_increment,
    
    `Name` varchar(100) not null
);

create table Class (
	Id integer primary key auto_increment,
    
    `Name` varchar(100) not null
);

create table Cadet (
    Id integer primary key auto_increment,
    
    FirstName varchar(100),
    LastName varchar(100) not null,
    ClassId integer not null, -- **`not null` constraint not present in the database (as of 2020-12-30)**
    PlatoonId integer not null, -- **`not null` constraint not present in the database (as of 2020-12-30)**
    SharePoints boolean not null, -- attribute to identify Cadet's that consented to make their point totals public
    CognitoUsername varchar(100) not null, -- links a table entry to a user in an AWS Cognito user pool
    
    foreign key (PlatoonId) references Platoon(Id),
    foreign key (ClassId) references Class(Id)
);

create table StaffType (
    Id integer primary key auto_increment,
	
    `Name` varchar(100) not null
);

create table Staff (
    Id integer primary key auto_increment,
    
    FirstName varchar(100),
    LastName varchar(100) not null,
    StaffType integer not null,
    Phone varchar(20),
    Email varchar(100),
    
    foreign key (StaffType) references StaffType(Id)
);

create table CadetToStaff (
    CadetId integer,
    StaffId integer,
    
    primary key (CadetId, StaffId),
    foreign key (CadetId) references Cadet(Id),
    foreign key (StaffId) references Staff(Id)
);

/* RESOURCES */
-------------------------------------------------------------------------------

create table ResourceCategory (
	Id integer primary key auto_increment,
    
    `Name` varchar(100) not null
);

create table Resource (
    Id integer primary key auto_increment,
    
    Title varchar(100) not null,
    CategoryId integer not null, -- **`not null` constraint not present in the database (as of 2020-12-30)**
    Description varchar(1000),
    MediaURL varchar(1000),
    PointThreshold int, -- if not null, limits access to a Resource by a user based on their current point totals
    
    foreign key (CategoryId) references ResourceCategory(Id)
);

/* NOTIFICATIONS */
-------------------------------------------------------------------------------

create table Notification (
    Id integer primary key auto_increment,
    
    Title varchar(100) not null,
    Description varchar(1000),
    MediaURL varchar(500),
    CreationDateTime datetime default now()
);

create table CadetToNotification (
    CadetId integer,
    NotificationId integer,
	
    Viewed datetime, -- value identifies the first date/time when the Notification was viewed
    
    primary key(CadetId, NotificationId),
    foreign key (CadetId) references Cadet(Id),
    foreign key (NotificationId) references Notification(Id)
);

create table `Event` (
	Id integer primary key auto_increment,
    
    Title varchar(100) not null,
    Description varchar(1024),
    EventDate datetime not null,
    CreationDateTime datetime not null default now()
);

create table CadetToEvent (
	CadetId integer,
    EventId integer,
    
    Viewed datetime, -- value identifies the first date/time when the Event was viewed
    
    primary key (CadetId, EventId),
    foreign key (CadetId) references Cadet(Id),
    foreign key (EventId) references `Event`(Id)
);

/* ACTIONS */
-------------------------------------------------------------------------------

create table Goal (
	Id integer primary key auto_increment,
    
    `Name` varchar(100) not null
);

create table ActionOption (
	Id integer primary key auto_increment,
    
    GoalId integer not null, -- **`not null` constraint not present in the database (as of 2020-12-30)**
    CadetId integer, -- null value implies action visible to all users
    Title varchar(100) not null,
    Description varchar(1024),
    MediaURL varchar(1024),
    PointValue integer default 1,
    Saved boolean, -- if not null, identifies if the user wants to view this ActionOption in the ListActionOptions API
    
    foreign key (GoalId) references Goal(Id),
    foreign key (CadetId) references Cadet(Id)
);

create table ActionOptionUpdates (
    ActionOptionId integer,
    CadetId integer,

    Title varchar(100),
    Description varchar(512),
    MediaURL varchar(1024),

    primary key (ActionOptionId, CadetId),
    foreign key (ActionOptionId) references ActionOption(Id),
    foreign key (CadetId) references Cadet(Id)
);

create table ActionOptionDeletions (
	ActionOptionId integer,
    CadetId integer,

    primary key (ActionOptionId, CadetId),
    foreign key (ActionOptionId) references ActionOption(Id),
    foreign key (CadetId) references Cadet(Id)
);

create table ActionTemplate (
	Id integer primary key auto_increment,
    
    ActionOptionId integer,
    CadetId integer, -- null value implies action template record applies to all users
    DefaultTime time not null,
    DefaultDate date,
    DefaultDaysOfWeek varchar(7), -- "MTWHFSD"
    DefaultWeeklyFrequency integer, -- ex) value of 2 would repeat action every 2 week(s)
    DefaultDayOfMonth integer,
    DefaultMonthlyFrequency integer, -- ex) value of 1 would repeat action every 1 month(s)
    CreationDateTime datetime default now(),
    
    foreign key (ActionId) references ActionOption(Id),
    foreign key (CadetId) references Cadet(Id)
);

create table TemplateUpdates (
    TemplateId integer,
    CadetId integer,
    
    DefaultTime time,
    DefaultDate date,
    DefaultDaysOfWeek varchar(7),
    DefaultWeeklyFrequency integer,
    DefaultDayOfMonth integer,
    DefaultMonthlyFrequency integer,
    
    primary key (TemplateId, CadetId),
    foreign key (CadetId) references Cadet(Id),
    foreign key (TemplateId) references ActionTemplate(Id)
);

create table TemplateDeletions (
    TemplateId integer,
    CadetId integer,
    
	primary key (TemplateId, CadetId),
    foreign key (CadetId) references Cadet(Id),
    foreign key (TemplateId) references ActionTemplate(Id)
);

create table CompletedActions (
    TemplateId integer,
    CadetId integer,
    AssignmentDateTime datetime,
    
    CompletionDateTime datetime default now(),
    Evidence varchar(1024) not null, -- references a location in an S3 bucket
    
    primary key(TemplateId, CadetId, AssignmentDateTime),
    foreign key (TemplateId) references ActionTemplate(Id),
    foreign key (CadetId) references Cadet(Id)
);

create table ActionDateDeletions (
	TemplateId integer,
    CadetId integer,
    AssignmentDateTime datetime not null, -- references a date/time to explicitly deny from a user's assigned action date set

    CreationDateTime datetime default now(),
    
    primary key (TemplateId, CadetId, AssignmentDateTime),
    foreign key (TemplateId) references ActionTemplate(Id),
    foreign key (CadetId) references Cadet(Id)
);