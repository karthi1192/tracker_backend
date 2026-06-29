-- DHPL 2026 Holidays (Form V – Tamil Nadu)
INSERT INTO holidays (date, name) VALUES
  ('2026-01-01', 'New Year'),
  ('2026-01-15', 'Pongal'),
  ('2026-01-16', 'Thiruvalluvar Day'),
  ('2026-01-26', 'Republic Day'),
  ('2026-04-14', 'Dr. Ambedkar Jayanthi'),
  ('2026-05-01', 'May Day'),
  ('2026-08-15', 'Independence Day'),
  ('2026-09-14', 'Vinayaka Chathurthi'),
  ('2026-10-02', 'Gandhi Jayanthi'),
  ('2026-10-19', 'Ayutha Pooja'),
  ('2026-10-20', 'Vijaya Dasami'),
  ('2026-11-08', 'Deepavali'),
  ('2026-11-09', 'Deepavali'),
  ('2026-12-25', 'Christmas')
ON CONFLICT (date) DO NOTHING;

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
