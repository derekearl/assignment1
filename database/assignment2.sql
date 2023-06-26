INSERT INTO account (
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )
VALUES (
        'Tony',
        'Stark',
        'tony@starkent.com',
        'Iam1ronM@an'
    );
UPDATE account
SET account_type = 'Admin'
WHERE account_id = 1;
DELETE FROM account
WHERE account_id = 1;
UPDATE inventory
SET inv_description = REPLACE(
        inv_description,
        'the small interiors',
        'a huge interior'
    )
WHERE inv_id = 10;
SELECT inv.inv_make,
    inv.inv_model,
    inv.classification_id,
    classif.classification_name
FROM inventory inv
    INNER JOIN classification classif ON inv.classification_id = classif.classification_id
WHERE classif.classification_name = 'Sport';
UPDATE inventory
SET inv_image = REPLACE(
        inv_image,
        '/images/',
        '/images/vehicles/'
    ),
    inv_thumbnail = REPLACE(
        inv_thumbnail,
        '/images/',
        '/images/vehicles/'
    );