# https://pm25-cloud-run-anqwcyx7xa-as.a.run.app/rest/getPM25byProvinceAsCSV?dt=2023-06-06 08:00
# Risk Assessment: Overlaying hotspot data with the age of rice allows you to
# assess the risk of crop damage or loss at different growth stages. Younger
# rice plants may be more vulnerable to hotspots due to their limited root
# systems and lower resilience. Assessing the timing and location of hotspots in
# relation to the age of rice can help identify areas where specific management
# practices or interventions are necessary to minimize yield losses.

import datetime
import requests
import os

url = "https://pm25-cloud-run-anqwcyx7xa-as.a.run.app/rest/getPM25byProvinceAsCSV?dt="
month = 5

for i in range(1, 32):
    for j in range(0, 24):
        # Get date
        try:
            date = datetime.datetime(
                2023, month, i, j, 0).strftime('%Y-%m-%d')
        except ValueError:
            break
        # Get time
        time = datetime.datetime(
            2023, month, i, j, 0).strftime('%H-%M')
        # If folder not exist, create folder
        if not os.path.exists(f'pm25/{date[:-3]}/{date}'):
            os.makedirs(f'pm25/{date[:-3]}/{date}')
        # Open file
        fp = open(f'pm25/{date[:-3]}/{date}/{date}_{time}.csv',
                  'w', newline='', encoding='utf-8')
        # Get data from API
        try:
            r = requests.get(url + date + " " + time.replace('-', ':'))
        except Exception as e:
            print(e)
            continue
        print(r.text)
        # print(url + date + " " + time)
        # # Write data to csv file
        # rows = []
        # for line in r.text.splitlines()[1:]:
        #     rows.append(line.split(','))
        # writer = csv.writer(fp)
        # writer.writerow(r.text.splitlines()[0].split(','))
        # writer.writerows(rows)
        fp.close()
