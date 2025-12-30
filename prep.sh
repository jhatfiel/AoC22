year=2019
for day in {01..25}; do
  echo "$year$day"
  mkdir -p data/$year/$day src/$year/$day && touch data/$year/$day/sample.txt data/$year/$day/input.txt data/$year/$day/desc.txt src/$year/$day/a$year$day.ts
done