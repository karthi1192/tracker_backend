-- Recurring meetings
INSERT INTO meetings (title, date, start_hour, start_min, end_hour, end_min, meet_link, attendees) VALUES
  ('Daily standup – Dev team', '2026-06-25', 9, 15, 10, 0, 'https://meet.google.com/pbc-fmpg-zzc', ARRAY['Anandharaj','Chandrasekaran','Gayathri','Gokulakrishnan','John','Rishivendhan','Yuvaraj']),
  ('Daily standup – Dev team', '2026-06-26', 9, 15, 10, 0, 'https://meet.google.com/pbc-fmpg-zzc', ARRAY['Anandharaj','Chandrasekaran','Gayathri','Gokulakrishnan','John','Rishivendhan','Yuvaraj']),
  ('Weekly Review – Dev team', '2026-06-26', 15, 30, 16, 30, 'https://meet.google.com/aix-udec-rqe', ARRAY['Yuvaraj','John','Rishivendhan','Chandrasekaran','Gayathri','Anandharaj','Gokulakrishnan']),
  ('Weekly meeting',           '2026-06-26', 15, 30, 16, 30, 'https://meet.google.com/qko-xoer-omm', ARRAY['Yuvaraj','Rishivendhan','Chandrasekaran','Bhuvaneshwari','Anandharaj','Gokulakrishnan','Ajaykumar']),
  ('Daily standup – Dev team', '2026-06-29', 9, 15, 10, 0, 'https://meet.google.com/pbc-fmpg-zzc', ARRAY['Anandharaj','Chandrasekaran','Gayathri','Gokulakrishnan','John','Rishivendhan','Yuvaraj']),
  ('Daily standup – Dev team', '2026-06-30', 9, 15, 10, 0, 'https://meet.google.com/pbc-fmpg-zzc', ARRAY['Anandharaj','Chandrasekaran','Gayathri','Gokulakrishnan','John','Rishivendhan','Yuvaraj']),
  ('Daily standup – Dev team', '2026-07-01', 9, 15, 10, 0, 'https://meet.google.com/pbc-fmpg-zzc', ARRAY['Anandharaj','Chandrasekaran','Gayathri','Gokulakrishnan','John','Rishivendhan','Yuvaraj']),
  ('Daily standup – Dev team', '2026-07-02', 9, 15, 10, 0, 'https://meet.google.com/pbc-fmpg-zzc', ARRAY['Anandharaj','Chandrasekaran','Gayathri','Gokulakrishnan','John','Rishivendhan','Yuvaraj'])
ON CONFLICT DO NOTHING;
